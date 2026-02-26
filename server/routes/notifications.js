const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/auth');

// GET /api/notifications
router.get('/', verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ isActive: true })
            .populate('sentBy', 'name email role')
            .sort({ sentAt: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/notifications/student/:studentId
router.get('/student/:studentId', verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.find({
            isActive: true,
            $or: [
                { 'recipients.allStudents': true },
                { 'recipients.students': req.params.studentId }
            ]
        })
            .populate('sentBy', 'name email role')
            .sort({ sentAt: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/notifications/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id)
            .populate('sentBy', 'name email role');
        res.json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/notifications
router.post('/', verifyToken, async (req, res) => {
    try {
        const data = { ...req.body, sentBy: req.userId, sentAt: new Date() };
        const notification = await Notification.create(data);
        res.status(201).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', verifyToken, async (req, res) => {
    try {
        const { studentId } = req.body;
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { $push: { readStatus: { recipient: studentId, isRead: true, readAt: new Date() } } },
            { new: true }
        );
        res.json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/notifications/:id
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/notifications/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
