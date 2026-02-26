const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { verifyToken } = require('../middleware/auth');

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
