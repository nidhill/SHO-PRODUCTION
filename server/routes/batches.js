const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const School = require('../models/School');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Helper: Build the correct Mongoose filter for batches based on user role
async function buildBatchFilter(user, baseFilter = { isActive: true }) {
    const superRoles = ['admin', 'leadership', 'ceo_haca'];
    if (superRoles.includes(user.role)) return baseFilter; // see ALL

    // SSHO / academic / pl → all batches in their assigned school(s)
    if (['ssho', 'academic', 'pl'].includes(user.role)) {
        if (user.assignedSchools?.length > 0) {
            return { ...baseFilter, school: { $in: user.assignedSchools } };
        }
        // fallback: resolve by school string
        if (user.school) {
            const schoolDoc = await School.findOne({
                $or: [{ name: user.school }, { name: { $regex: user.school, $options: 'i' } }]
            });
            if (schoolDoc) return { ...baseFilter, school: schoolDoc._id };
        }
        return { ...baseFilter, _id: { $in: [] } }; // nothing
    }

    // Mentor → batches where they are in assignedMentors
    if (user.role === 'mentor') {
        return { ...baseFilter, assignedMentors: user._id };
    }

    // SHO → batches where they are the assignedSHO
    return { ...baseFilter, assignedSHO: user._id };
}

// Helper: Build the correct student filter (scoped to same batches the user can see)
async function buildStudentFilter(user, baseFilter = { isActive: true }) {
    const superRoles = ['admin', 'leadership', 'ceo_haca'];
    if (superRoles.includes(user.role)) return baseFilter;

    if (['ssho', 'academic', 'pl'].includes(user.role)) {
        if (user.assignedSchools?.length > 0) {
            return { ...baseFilter, school: { $in: user.assignedSchools } };
        }
        if (user.school) {
            const schoolDoc = await School.findOne({
                $or: [{ name: user.school }, { name: { $regex: user.school, $options: 'i' } }]
            });
            if (schoolDoc) return { ...baseFilter, school: schoolDoc._id };
        }
        return { ...baseFilter, _id: { $in: [] } };
    }

    // Mentor → students in their assigned mentor batches
    if (user.role === 'mentor') {
        const myBatches = await Batch.find({ assignedMentors: user._id, isActive: true }, '_id');
        const batchIds = myBatches.map(b => b._id);
        return { ...baseFilter, batch: { $in: batchIds } };
    }

    // SHO → students in their assigned batches
    const myBatches = await Batch.find({ assignedSHO: user._id, isActive: true }, '_id');
    const batchIds = myBatches.map(b => b._id);
    return { ...baseFilter, batch: { $in: batchIds } };
}

// GET /api/batches
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = req.user;
        const filter = await buildBatchFilter(req.user);

        const batches = await Batch.find(filter)
            .populate('school', 'name address place')
            .populate('assignedSHO', 'name email role')
            .populate('assignedSSHO', 'name email role')
            .populate('assignedMentors', 'name email role');
        res.json({ success: true, batches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/batches/analytics
router.get('/analytics', verifyToken, async (req, res) => {
    try {
        const batchFilter = await buildBatchFilter(req.user);
        const studentFilter = await buildStudentFilter(req.user);

        const totalBatches = await Batch.countDocuments(batchFilter);
        const totalStudents = await Student.countDocuments(studentFilter);

        res.json({
            success: true,
            analytics: {
                totalBatches,
                totalStudents,
                averageAttendance: 0,
                averageFeedbackScore: 0,
                assignmentCompletionRate: 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/batches/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate('school', 'name address place')
            .populate('assignedSHO', 'name email role')
            .populate('assignedSSHO', 'name email role')
            .populate('assignedMentors', 'name email role');
        res.json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/batches/:id/students
router.get('/:id/students', verifyToken, async (req, res) => {
    try {
        const students = await Student.find({ batch: req.params.id, isActive: true })
            .populate('batch', 'name code')
            .populate('school', 'name');
        res.json({ success: true, students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/batches/:id/transfer — Transfer students to another batch
router.post('/:id/transfer', verifyToken, async (req, res) => {
    try {
        const { targetBatchId, studentIds } = req.body;
        if (!targetBatchId) return res.status(400).json({ success: false, message: 'targetBatchId is required' });

        const sourceBatch = await Batch.findById(req.params.id);
        const targetBatch = await Batch.findById(targetBatchId);
        if (!sourceBatch || !targetBatch) return res.status(404).json({ success: false, message: 'Batch not found' });

        // Build filter: either specific students or ALL students in source batch
        const studentFilter = { batch: req.params.id, isActive: true };
        if (studentIds && studentIds.length > 0) {
            studentFilter._id = { $in: studentIds };
        }

        const result = await Student.updateMany(studentFilter, {
            batch: targetBatchId,
            school: targetBatch.school
        });

        // Update student counts on both batches
        const sourceCount = await Student.countDocuments({ batch: req.params.id, isActive: true });
        const targetCount = await Student.countDocuments({ batch: targetBatchId, isActive: true });
        sourceBatch.totalStudents = sourceCount;
        targetBatch.totalStudents = targetCount;
        await sourceBatch.save();
        await targetBatch.save();

        res.json({
            success: true,
            message: `${result.modifiedCount} student(s) transferred to ${targetBatch.name}`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// PUT /api/batches/:id/assign-sho
router.put('/:id/assign-sho', verifyToken, async (req, res) => {
    try {
        const { userId } = req.body;
        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            { assignedSHO: userId || null },
            { new: true }
        ).populate('assignedSHO', 'name email role');
        res.json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/batches/:id/assign-ssho
router.put('/:id/assign-ssho', verifyToken, async (req, res) => {
    try {
        const { userId } = req.body;
        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            { assignedSSHO: userId || null },
            { new: true }
        ).populate('assignedSSHO', 'name email role');
        res.json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/batches/:id/mentors — add a mentor
router.post('/:id/mentors', verifyToken, async (req, res) => {
    try {
        const { userId } = req.body;
        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { assignedMentors: userId } },
            { new: true }
        ).populate('assignedMentors', 'name email role');
        // Also add batch to mentor's assignedBatches
        await User.findByIdAndUpdate(userId, { $addToSet: { assignedBatches: req.params.id } });
        res.json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/batches/:id/mentors/:userId — remove a mentor
router.delete('/:id/mentors/:userId', verifyToken, async (req, res) => {
    try {
        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            { $pull: { assignedMentors: req.params.userId } },
            { new: true }
        ).populate('assignedMentors', 'name email role');
        await User.findByIdAndUpdate(req.params.userId, { $pull: { assignedBatches: req.params.id } });
        res.json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/batches
router.post('/', verifyToken, async (req, res) => {
    try {
        const batch = await Batch.create(req.body);
        res.status(201).json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/batches/:id
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/batches/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Batch.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
