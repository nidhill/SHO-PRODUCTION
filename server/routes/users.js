const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { verifyToken } = require('../middleware/auth');
const { sendEmail, welcomeTemplate } = require('../services/email');

// GET /api/users
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = req.user;
        let filter = { isActive: true };

        // All authenticated roles can list users (needed for batch assignment UIs)
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
        const callerRole = req.user.role;
        const { name, email, password, role, phone, assignedBatches, school, subject } = req.body;

        // ssho / academic / pl can only create mentor users
        const managerRoles = ['ssho', 'academic', 'pl'];
        if (managerRoles.includes(callerRole)) {
            if (role !== 'mentor') {
                return res.status(403).json({ success: false, message: 'You can only create Mentor users.' });
            }
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const userData = { name, email, password: password || 'password', role, phone };
        if (subject) userData.subject = subject;

        // Assign school: use provided school or fall back to caller's school for managers
        const resolvedSchool = school || (managerRoles.includes(callerRole) ? req.user.school : '');
        if (resolvedSchool && (role === 'ssho' || role === 'sho' || role === 'mentor')) userData.school = resolvedSchool;

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

        // Send welcome email with credentials (fire-and-forget)
        const tempPassword = password || 'password';
        sendEmail(
            user.email,
            'Welcome to SHO App – Your Account Details',
            welcomeTemplate(user.name, user.role, user.email, tempPassword)
        ).catch(err => console.error('[Email] Welcome email failed:', err));

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
