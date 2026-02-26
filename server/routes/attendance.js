const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { verifyToken } = require('../middleware/auth');

// GET /api/attendance/batch/:batchId
router.get('/batch/:batchId', verifyToken, async (req, res) => {
    try {
        const query = { batch: req.params.batchId };
        if (req.query.date) {
            query.date = new Date(req.query.date);
        }
        const attendance = await Attendance.find(query)
            .populate('students.student', 'name email')
            .populate('markedBy', 'name')
            .sort({ date: -1 });
        res.json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/attendance/student/:studentId
router.get('/student/:studentId', verifyToken, async (req, res) => {
    try {
        const attendance = await Attendance.find({
            'students.student': req.params.studentId
        }).sort({ date: -1 });
        res.json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/attendance
router.post('/', verifyToken, async (req, res) => {
    try {
        const data = {
            ...req.body,
            markedBy: req.userId
        };
        const present = data.students?.filter(s => s.status === 'present').length || 0;
        const total = data.students?.length || 1;
        data.totalPresent = present;
        data.totalAbsent = total - present;
        data.attendancePercentage = Math.round((present / total) * 100);

        const attendance = await Attendance.create(data);
        res.status(201).json({ success: true, message: 'Attendance marked successfully', attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/attendance/:id
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
