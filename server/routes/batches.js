const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const { verifyToken } = require('../middleware/auth');

// GET /api/batches
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = req.user;
        let filter = { isActive: true };

        if (user.role === 'sho' || user.role === 'mentor') {
            filter._id = { $in: user.assignedBatches || [] };
        } else if (user.role === 'ssho') {
            const dbSchoolName = user.school ? user.school.replace('_', ' ') : '';
            const dbSchool = await require('../models/School').findOne({ name: new RegExp('^' + dbSchoolName.split(' ')[0], 'i') });
            filter.school = dbSchool ? dbSchool._id : null;
        }
        // leadership/admin: no filter, sees all

        const batches = await Batch.find(filter)
            .populate('school', 'name address place')
            .populate('assignedSHO', 'name email role')
            .populate('assignedMentors', 'name email role');
        res.json({ success: true, batches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/batches/analytics
router.get('/analytics', verifyToken, async (req, res) => {
    try {
        const user = req.user;
        let filter = { isActive: true };

        if (user.role === 'sho' || user.role === 'mentor') {
            filter._id = { $in: user.assignedBatches || [] };
        } else if (user.role === 'ssho') {
            const dbSchoolName = user.school ? user.school.replace('_', ' ') : '';
            const dbSchool = await require('../models/School').findOne({ name: new RegExp('^' + dbSchoolName.split(' ')[0], 'i') });
            filter.school = dbSchool ? dbSchool._id : null;
        }

        const totalBatches = await Batch.countDocuments(filter);

        let studentFilter = { isActive: true };
        if (user.role === 'sho' || user.role === 'mentor') {
            studentFilter.batch = { $in: user.assignedBatches || [] };
        } else if (user.role === 'ssho') {
            const dbSchoolName = user.school ? user.school.replace('_', ' ') : '';
            const dbSchool = await require('../models/School').findOne({ name: new RegExp('^' + dbSchoolName.split(' ')[0], 'i') });
            studentFilter.school = dbSchool ? dbSchool._id : null;
        }

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
