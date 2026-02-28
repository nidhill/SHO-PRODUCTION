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
        const { batch, date, students } = req.body;

        // Strip out the time from the date to ensure unique daily records
        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0);

        const present = students?.filter(s => s.status === 'present').length || 0;
        const total = students?.length || 1;

        const data = {
            batch,
            date: searchDate,
            students,
            markedBy: req.userId,
            totalPresent: present,
            totalAbsent: total - present,
            attendancePercentage: Math.round((present / total) * 100)
        };

        // Use findOneAndUpdate with upsert: true to either update today's existing record or create a new one
        const attendance = await Attendance.findOneAndUpdate(
            { batch, date: searchDate },
            { $set: data },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: 'Attendance saved successfully', attendance });
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
