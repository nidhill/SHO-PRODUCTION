const express = require('express');
const router = express.Router();
const ClassPlanner = require('../models/ClassPlanner');
const { verifyToken } = require('../middleware/auth');

// GET /api/class-planner
router.get('/', verifyToken, async (req, res) => {
    try {
        const classes = await ClassPlanner.find({ isActive: true })
            .populate('batch', 'name code')
            .populate('conductedBy', 'name email')
            .sort({ date: -1 });
        res.json({ success: true, classes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/class-planner/batch/:batchId
router.get('/batch/:batchId', verifyToken, async (req, res) => {
    try {
        const classes = await ClassPlanner.find({ batch: req.params.batchId, isActive: true })
            .populate('batch', 'name code')
            .populate('conductedBy', 'name email')
            .sort({ date: -1 });
        res.json({ success: true, classes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/class-planner
router.post('/', verifyToken, async (req, res) => {
    try {
        const classEntry = await ClassPlanner.create(req.body);
        res.status(201).json({ success: true, class: classEntry });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/class-planner/:id
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const classEntry = await ClassPlanner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, class: classEntry });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/class-planner/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await ClassPlanner.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
