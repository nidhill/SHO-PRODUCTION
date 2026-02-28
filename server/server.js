require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ─── Middleware ─────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Routes ────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/schools', require('./routes/schools'));
app.use('/api/batches', require('./routes/batches'));
app.use('/api/students', require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/class-planner', require('./routes/classPlanner'));
app.use('/api/audit-logs', require('./routes/auditLogs'));
app.use('/api/sync', require('./routes/sync'));

// Health check (also shows which MongoDB is connected)
app.get('/api/health', (_req, res) => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sho_app';
    const isAtlas = uri.includes('mongodb+srv');
    res.json({
        success: true,
        message: 'SHO Server is running',
        db: isAtlas ? 'Atlas (Production)' : 'Local MongoDB',
        port: process.env.PORT || 5000
    });
});

// ─── MongoDB Connection ────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sho_app';
const PORT = process.env.PORT || 5000;

// Removed unused backend Supabase imports

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

// Just a test to force nodemon restart
console.log('');
