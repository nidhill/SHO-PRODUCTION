const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const School = require('../models/School');
const Batch = require('../models/Batch');
const { verifyToken } = require('../middleware/auth');

// Build correct student filter per role
async function buildStudentFilter(user, base = { isActive: true }) {
    const superRoles = ['admin', 'leadership', 'ceo_haca'];
    if (superRoles.includes(user.role)) return base;

    if (['ssho', 'academic', 'pl'].includes(user.role)) {
        if (user.assignedSchools?.length > 0)
            return { ...base, school: { $in: user.assignedSchools } };
        if (user.school) {
            const s = await School.findOne({
                $or: [{ name: user.school }, { name: { $regex: user.school, $options: 'i' } }]
            });
            if (s) return { ...base, school: s._id };
        }
        return { ...base, _id: { $in: [] } };
    }

    // SHO / mentor: only students in their batches
    const myBatches = await Batch.find({ assignedSHO: user._id, isActive: true }, '_id');
    return { ...base, batch: { $in: myBatches.map(b => b._id) } };
}

// GET /api/students
router.get('/', verifyToken, async (req, res) => {
    try {
        const filter = await buildStudentFilter(req.user);
        const students = await Student.find(filter)
            .populate('batch', 'name code')
            .populate('school', 'name address place');
        res.json({ success: true, students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/students/analytics
router.get('/analytics', verifyToken, async (req, res) => {
    try {
        const filter = await buildStudentFilter(req.user);
        const totalStudents = await Student.countDocuments(filter);
        const activeStudents = await Student.countDocuments({ ...filter, status: 'active' });
        const placedStudents = await Student.countDocuments({ ...filter, status: 'placed' });
        const interviewRequired = await Student.countDocuments({ ...filter, status: 'interview_required' });
        const revokedStudents = await Student.countDocuments({ ...filter, status: 'revoked' });
        res.json({
            success: true,
            analytics: { totalStudents, activeStudents, placedStudents, interviewRequired, revokedStudents }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/students/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('batch', 'name code')
            .populate('school', 'name address place');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/students
router.post('/', verifyToken, async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json({ success: true, student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/students/:id
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/students/:id/status
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json({ success: true, student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/students/:id/co-curriculum/:type
router.patch('/:id/co-curriculum/:type', verifyToken, async (req, res) => {
    try {
        const { type } = req.params;
        const update = { $push: { [`coCurriculum.${type}`]: req.body } };
        const student = await Student.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json({ success: true, student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/students/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
