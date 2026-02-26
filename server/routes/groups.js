const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { verifyToken } = require('../middleware/auth');

// GET /api/groups
router.get('/', verifyToken, async (req, res) => {
    try {
        const groups = await Group.find({ isActive: true })
            .populate('batch', 'name code')
            .populate('createdBy', 'name email')
            .populate('members.student', 'name email');
        res.json({ success: true, groups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/groups/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('batch', 'name code')
            .populate('createdBy', 'name email')
            .populate('members.student', 'name email');
        res.json({ success: true, group });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/groups
router.post('/', verifyToken, async (req, res) => {
    try {
        const data = { ...req.body, createdBy: req.userId };
        const group = await Group.create(data);
        res.status(201).json({ success: true, group });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/groups/:id/members
router.post('/:id/members', verifyToken, async (req, res) => {
    try {
        const { studentId, role } = req.body;
        const group = await Group.findByIdAndUpdate(
            req.params.id,
            { $push: { members: { student: studentId, role: role || 'member', joinedAt: new Date() } } },
            { new: true }
        ).populate('members.student', 'name email');
        res.json({ success: true, group });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/groups/:id/members/:studentId
router.delete('/:id/members/:studentId', verifyToken, async (req, res) => {
    try {
        const group = await Group.findByIdAndUpdate(
            req.params.id,
            { $pull: { members: { student: req.params.studentId } } },
            { new: true }
        ).populate('members.student', 'name email');
        res.json({ success: true, group });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/groups/:id
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, group });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/groups/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Group.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
