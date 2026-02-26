const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { verifyToken } = require('../middleware/auth');

// GET /api/assignments
router.get('/', verifyToken, async (req, res) => {
    try {
        const assignments = await Assignment.find({ isActive: true })
            .populate('batch', 'name code')
            .populate('assignedBy', 'name email')
            .populate('submissions.student', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, assignments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/assignments/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('batch', 'name code')
            .populate('assignedBy', 'name email')
            .populate('submissions.student', 'name email');
        res.json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/assignments
router.post('/', verifyToken, async (req, res) => {
    try {
        const data = { ...req.body, assignedBy: req.userId };
        const assignment = await Assignment.create(data);
        res.status(201).json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/assignments/:id/submit
router.post('/:id/submit', verifyToken, async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { $push: { submissions: req.body } },
            { new: true }
        );
        res.json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/assignments/:id/grade
router.patch('/:id/grade', verifyToken, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        // Find submission and update
        const sub = assignment.submissions.id(req.body.submissionId);
        if (sub) {
            sub.score = req.body.score;
            sub.feedback = req.body.feedback;
            sub.status = 'graded';
        }
        await assignment.save();
        res.json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/assignments/:id
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/assignments/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Assignment.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
