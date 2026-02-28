const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { verifyToken } = require('../middleware/auth');

// GET /api/students
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = req.user;
        let filter = { isActive: true };

        if (user.role === 'sho' || user.role === 'mentor') {
            filter.batch = { $in: user.assignedBatches || [] };
        } else if (user.role === 'ssho') {
            const dbSchoolName = user.school ? user.school.replace('_', ' ') : '';
            const dbSchool = await require('../models/School').findOne({ name: new RegExp('^' + dbSchoolName.split(' ')[0], 'i') });
            filter.school = dbSchool ? dbSchool._id : null;
        }
        // leadership: no filter, sees all

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
        const user = req.user;
        let filter = { isActive: true };

        if (user.role === 'sho' || user.role === 'mentor') {
            filter.batch = { $in: user.assignedBatches || [] };
        } else if (user.role === 'ssho') {
            const dbSchoolName = user.school ? user.school.replace('_', ' ') : '';
            const dbSchool = await require('../models/School').findOne({ name: new RegExp('^' + dbSchoolName.split(' ')[0], 'i') });
            filter.school = dbSchool ? dbSchool._id : null;
        }
        // leadership, ceo_haca, head_academics: no filter, sees all

        const totalStudents = await Student.countDocuments(filter);
        const activeStudents = await Student.countDocuments({ ...filter, status: 'active' });
        const placedStudents = await Student.countDocuments({ ...filter, status: 'placed' });
        const interviewRequired = await Student.countDocuments({ ...filter, status: 'interview_required' });
        const revokedStudents = await Student.countDocuments({ ...filter, status: 'revoked' });
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
