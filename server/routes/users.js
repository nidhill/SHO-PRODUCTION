const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { verifyToken } = require('../middleware/auth');

// GET /api/users
router.get('/', verifyToken, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            users: users.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                phone: u.phone,
                assignedBatches: u.assignedBatches
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/users
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        const user = await User.create({ name, email, password: password || 'password', role, phone });

        await AuditLog.create({
            userId: req.userId,
            userName: req.user.name,
            userRole: req.user.role,
            action: 'CREATE_USER',
            details: `Created user ${name} (${role})`,
            target: user._id.toString(),
            ip: req.ip
        });

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                assignedBatches: user.assignedBatches
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/users/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await AuditLog.create({
            userId: req.userId,
            userName: req.user.name,
            userRole: req.user.role,
            action: 'DELETE_USER',
            details: `Deleted user ${user.name}`,
            target: user._id.toString(),
            ip: req.ip
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
