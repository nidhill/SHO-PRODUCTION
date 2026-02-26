const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateToken, verifyToken } = require('../middleware/auth');
const { sendEmail } = require('../services/email');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        console.log("=== LOGIN DEBUG ===");
        const { email, password } = req.body;

        // --- INJECTED FILE LOGGING ---
        try {
            const logPath = path.join(__dirname, '..', 'login-debug.txt');
            fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] LOGIN PAYLOAD: email="${email}", password="${password}"\n`);
        } catch (e) { }
        // -----------------------------

        console.log("Login attempt for raw email:", `"${email}"`);

        const normalizedEmail = email.toLowerCase().trim();
        console.log("Normalized email:", `"${normalizedEmail}"`);

        const user = await User.findOne({ email: normalizedEmail, isActive: true });
        console.log("User found in DB:", user ? "Yes" : "No");

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials - User not found' });
        }

        const isMatch = await user.comparePassword(password);
        console.log("Password match:", isMatch ? "Yes" : "No");

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials - Password incorrect' });
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
                assignedBatches: user.assignedBatches
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json({
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

module.exports = router;

// PUT /api/auth/profile/password
router.put('/profile/password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

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

        // Send email notification via Resend
        const emailHtml = `
            <h2>Password Changed Successfully</h2>
            <p>Hi ${user.name},</p>
            <p>Your password for your SHO App account has been successfully changed.</p>
            <p>If you did not make this change, please contact your system administrator immediately.</p>
            <br>
            <p>Best regards,</p>
            <p>SHO App Team</p>
        `;

        // Fire and forget email - don't block the response if email fails
        sendEmail(user.email, 'Security Alert: Password Changed - SHO App', emailHtml)
            .catch(err => console.error('Failed to send password change email:', err));

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the password' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        console.log("=== FORGOT PASSWORD DEBUG ===");
        console.log("Raw body:", req.body);

        if (!req.body || !req.body.email) {
            console.log("Error: Email missing from request body");
            return res.status(400).json({ success: false, message: 'Bad Request: Email is required' });
        }

        const normalizedEmail = req.body.email.toLowerCase().trim();
        console.log('Normalized email to search:', `"${normalizedEmail}"`);

        const user = await User.findOne({ email: normalizedEmail });
        console.log("User found:", user ? user.email : "null");

        if (!user) {
            return res.status(404).json({ success: false, message: 'There is no user with that email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        // In local development, frontend runs on port 5173
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const message = `
            <h2>Password Reset Request</h2>
            <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 10 minutes.</p>
            <br>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            <br>
            <p>Best regards,</p>
            <p>SHO App Team</p>
        `;

        try {
            await sendEmail(user.email, 'Password Reset Token - SHO App', message);

            await AuditLog.create({
                userId: user._id,
                userName: user.name,
                userRole: user.role,
                action: 'FORGOT_PASSWORD_REQUEST',
                details: 'User requested a password reset email',
                ip: req.ip
            });

            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Set new password
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
        const message = `
            <h2>Password Reset Successful</h2>
            <p>Hi ${user.name},</p>
            <p>This is a confirmation that the password for your account has just been changed.</p>
            <br>
            <p>Best regards,</p>
            <p>SHO App Team</p>
        `;

        sendEmail(user.email, 'Password Changed Successfully - SHO App', message)
            .catch(err => console.error('Failed to send password reset confirmation email:', err));

        res.status(200).json({ success: true, message: 'Password has been updated' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'An error occurred while resetting your password' });
    }
});
