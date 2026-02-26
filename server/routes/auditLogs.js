const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { verifyToken } = require('../middleware/auth');

// GET /api/audit-logs
router.get('/', verifyToken, async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(200);
        res.json({
            success: true,
            logs: logs.map(l => ({
                id: l._id,
                userId: l.userId,
                userName: l.userName,
                userRole: l.userRole,
                action: l.action,
                target: l.target,
                details: l.details,
                timestamp: l.createdAt,
                ip: l.ip
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
