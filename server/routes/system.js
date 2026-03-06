const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/auth');

// GET /api/system/storage
// Fetch MongoDB storage stats (Admin only)
router.get('/storage', verifyToken, async (req, res) => {
    try {
        const user = req.user;
        if (!['admin', 'ceo_haca', 'leadership'].includes(user.role)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const stats = await mongoose.connection.db.stats();

        // Calculate a mock "Total Capacity" if on a free tier or custom limits
        // Let's assume a generic 512MB free cluster (Atlas M0) for visual purposes
        // 512MB = 536870912 bytes
        const maxCapacityBytes = process.env.MAX_STORAGE_BYTES || 536870912;

        res.json({
            success: true,
            storage: {
                dbName: stats.db,
                collections: stats.collections,
                objects: stats.objects,
                dataSizeBytes: stats.dataSize,
                storageSizeBytes: stats.storageSize,
                indexes: stats.indexes,
                indexSizeBytes: stats.indexSize,
                maxCapacityBytes: maxCapacityBytes,
                usedPercentage: ((stats.storageSize / maxCapacityBytes) * 100).toFixed(2)
            }
        });
    } catch (error) {
        console.error('Storage Stats Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch storage stats' });
    }
});

module.exports = router;
