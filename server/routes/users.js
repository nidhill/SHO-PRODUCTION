const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { verifyToken } = require('../middleware/auth');

// GET /api/users
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = req.user;
        let filter = { isActive: true };

        // Admin/leadership/ceo see everybody; school-level roles see all users
        // (needed so School Management page can pick SHOs/SSHOs/Mentors)
        const users = await User.find(filter).select('-password');
        res.json({
            success: true,
            users: users.map(u => ({
                _id: u._id,
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                phone: u.phone,
                school: u.school,
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
        const { name, email, password, role, phone, assignedBatches, school } = req.body;
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const userData = { name, email, password: password || 'password', role, phone };

        // Handle specific role assignments
        if (school && (role === 'ssho' || role === 'sho')) userData.school = school;
        if (assignedBatches && assignedBatches.length > 0) userData.assignedBatches = assignedBatches;

        const user = await User.create(userData);

        // Update corresponding Batches
        if (assignedBatches && assignedBatches.length > 0) {
            const Batch = require('../models/Batch');
            if (role === 'sho') {
                await Batch.updateMany(
                    { _id: { $in: assignedBatches } },
                    { $set: { assignedSHO: user._id } }
                );
            } else if (role === 'mentor') {
                await Batch.updateMany(
                    { _id: { $in: assignedBatches } },
                    { $addToSet: { assignedMentors: user._id } }
                );
            }
        }

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

        const Batch = require('../models/Batch');
        if (user.role === 'sho') {
            await Batch.updateMany(
                { assignedSHO: user._id },
                { $unset: { assignedSHO: 1 } }
            );
        } else if (user.role === 'mentor') {
            await Batch.updateMany(
                { assignedMentors: user._id },
                { $pull: { assignedMentors: user._id } }
            );
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
