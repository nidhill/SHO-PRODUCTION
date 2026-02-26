const express = require('express');
const router = express.Router();
const School = require('../models/School');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const { verifyToken } = require('../middleware/auth');

// GET /api/schools
router.get('/', verifyToken, async (req, res) => {
    try {
        const schools = await School.find({ isActive: true });
        res.json({ success: true, schools });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/schools/analytics
router.get('/analytics', verifyToken, async (req, res) => {
    try {
        const schools = await School.find({ isActive: true });
        const totalStudents = await Student.countDocuments({ isActive: true });
        const schoolsList = await Promise.all(
            schools.map(async (s) => ({
                id: s._id,
                name: s.name,
                totalBatches: await Batch.countDocuments({ school: s._id, isActive: true }),
                totalStudents: await Student.countDocuments({ school: s._id, isActive: true })
            }))
        );
        res.json({
            success: true,
            analytics: {
                totalSchools: schools.length,
                totalStudents,
                schoolsList
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/schools/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        res.json({ success: true, school });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/schools
router.post('/', verifyToken, async (req, res) => {
    try {
        const school = await School.create(req.body);
        res.status(201).json({ success: true, school });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/schools/:id
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, school });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/schools/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await School.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
