const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { verifyToken } = require('../middleware/auth');

// GET /api/students
router.get('/', verifyToken, async (req, res) => {
    try {
        const students = await Student.find({ isActive: true })
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
        const totalStudents = await Student.countDocuments({ isActive: true });
        const activeStudents = await Student.countDocuments({ status: 'active', isActive: true });
        const placedStudents = await Student.countDocuments({ status: 'placed', isActive: true });
        const interviewRequired = await Student.countDocuments({ status: 'interview_required', isActive: true });
        const revokedStudents = await Student.countDocuments({ status: 'revoked', isActive: true });
        res.json({
            success: true,
            analytics: {
                totalStudents,
                activeStudents,
                placedStudents,
                interviewRequired,
                revokedStudents
            }
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
