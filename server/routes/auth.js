const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateToken, verifyToken } = require('../middleware/auth');
const {
    sendEmail,
    passwordResetTemplate,
    passwordChangedTemplate,
    welcomeTemplate,
} = require('../services/email');
const supabase = require('../config/supabase');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Debug log (remove in production)
        try {
            const logPath = path.join(__dirname, '..', 'login-debug.txt');
            fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] LOGIN: email="${email}"\n`);
        } catch (e) { }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail, isActive: true })
            .populate('assignedSchools', '_id name');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        let isMatch = await user.comparePassword(password);

        // Fallback to Supabase Auth
        if (!isMatch) {
            try {
                const { data } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
                if (data?.session) isMatch = true;
            } catch (err) {
                console.error('Supabase Auth Error:', err);
            }
        }

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user._id, user.role);

        await AuditLog.create({
            userId: user._id,
            userName: user.name,
            userRole: user.role,
            action: 'LOGIN',
            details: 'User logged in successfully',
            ip: req.ip
        });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                school: user.school,
                assignedBatches: user.assignedBatches,
                assignedSchools: user.assignedSchools
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-password')
            .populate('assignedSchools', '_id name');
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                school: user.school,
                assignedBatches: user.assignedBatches,
                assignedSchools: user.assignedSchools
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── PATCH /api/auth/profile — update own name/phone ────────────────────────
router.patch('/profile', verifyToken, async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (name) user.name = name.trim();
        if (phone !== undefined) user.phone = phone;
        await user.save({ validateBeforeSave: false });
        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── PUT /api/auth/profile/password ─────────────────────────────────────────
router.put('/profile/password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

        user.password = newPassword;
        await user.save();

        await AuditLog.create({
            userId: user._id,
            userName: user.name,
            userRole: user.role,
            action: 'PASSWORD_CHANGE',
            details: 'User updated their password',
            ip: req.ip
        });

        // Send professional security alert email
        sendEmail(
            user.email,
            'Security Alert: Your Password Was Changed – SHO App',
            passwordChangedTemplate(user.name)
        ).catch(err => console.error('[Email] Password change alert failed:', err));

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the password' });
    }
});

// ─── POST /api/auth/forgot-password ─────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
    try {
        if (!req.body?.email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const normalizedEmail = req.body.email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            // Don't reveal whether the email exists
            return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await sendEmail(
                user.email,
                'Reset Your Password – SHO App',
                passwordResetTemplate(user.name, resetUrl)
            );

            await AuditLog.create({
                userId: user._id,
                userName: user.name,
                userRole: user.role,
                action: 'FORGOT_PASSWORD_REQUEST',
                details: 'User requested a password reset email',
                ip: req.ip
            });

            res.status(200).json({ success: true, message: 'Password reset email sent. Please check your inbox.' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            console.error('[Email] Forgot password email failed:', err);
            return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
});

// ─── POST /api/auth/reset-password/:token ───────────────────────────────────
router.post('/reset-password/:token', async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired.' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        await AuditLog.create({
            userId: user._id,
            userName: user.name,
            userRole: user.role,
            action: 'PASSWORD_RESET',
            details: 'User successfully reset their password via email token',
            ip: req.ip
        });

        // Send confirmation email
        sendEmail(
            user.email,
            'Your Password Has Been Reset – SHO App',
            passwordChangedTemplate(user.name)
        ).catch(err => console.error('[Email] Reset confirmation email failed:', err));

        res.status(200).json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'An error occurred while resetting your password' });
    }
});

module.exports = router;
