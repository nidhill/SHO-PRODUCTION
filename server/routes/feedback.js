const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { verifyToken } = require('../middleware/auth');
const { sendEmail, feedbackFormTemplate } = require('../services/email');

// GET /api/feedback
router.get('/', verifyToken, async (req, res) => {
    try {
        const feedback = await Feedback.find({ isActive: true })
            .populate('student', 'name email')
            .populate('batch', 'name code')
            .populate('givenBy', 'name email role')
            .sort({ createdAt: -1 });
        res.json({ success: true, feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/feedback/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id)
            .populate('student', 'name email')
            .populate('batch', 'name code')
            .populate('givenBy', 'name email role');
        res.json({ success: true, feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/feedback/form/send
router.post('/form/send', verifyToken, async (req, res) => {
    try {
        const { targetType, targetId, formLink } = req.body;
        const Student = require('../models/Student');

        let toList = [];
        let recordData = {
            type: 'google_form',
            formLink,
            givenBy: req.userId,
            comments: `Feedback Form Sent: ${formLink}`
        };

        if (targetType === 'student') {
            const student = await Student.findById(targetId);
            if (!student || !student.email) throw new Error('Student or student email not found');
            toList.push({ email: student.email, name: student.name });
            recordData.student = targetId;
        } else if (targetType === 'batch') {
            const students = await Student.find({ batch: targetId, isActive: true });
            if (!students.length) throw new Error('No active students found in this batch');

            toList = students
                .filter(s => s.email)
                .map(s => ({ email: s.email, name: s.name }));

            recordData.batch = targetId;
        } else {
            return res.status(400).json({ success: false, message: 'Invalid targetType' });
        }

        if (toList.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid student emails found' });
        }

        // Send professional branded emails to each recipient
        const User = require('../models/User');
        const sender = await User.findById(req.userId).select('name');
        const senderName = sender?.name || 'SHO App Team';

        await Promise.all(
            toList.map(recipient =>
                sendEmail(
                    recipient.email,
                    'Feedback Request – SHO App',
                    feedbackFormTemplate(recipient.name, formLink, senderName)
                )
            )
        );

        // Save the record
        const feedback = await Feedback.create(recordData);
        res.status(201).json({ success: true, feedback });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/feedback
router.post('/', verifyToken, async (req, res) => {
    try {
        const data = { ...req.body, givenBy: req.userId };
        const feedback = await Feedback.create(data);
        res.status(201).json({ success: true, feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/feedback/:id
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/feedback/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Feedback.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
