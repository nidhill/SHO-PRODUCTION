require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const syncRouter = require('./routes/sync');

const app = express();

// ─── Middleware ─────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Render health checks)
        if (!origin) return callback(null, true);
        // Allow exact matches
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow any Vercel preview deployment (*.vercel.app)
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
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
app.use('/api/system', require('./routes/system'));
app.use('/api/sync', syncRouter);

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

// Import Supabase
const supabase = require('./config/supabase');

mongoose.connect(MONGODB_URI)
    .then(async () => {
        const isAtlas = MONGODB_URI.includes('mongodb+srv');

        console.log('\n=================================================');
        console.log('                 SHO APP BACKEND                 ');
        console.log('=================================================\n');

        console.log('📡 [DATABASE: MONGODB]');
        console.log(`   🔸 Status:  ✅ Connected successfully`);
        console.log(`   🔸 Type:    ${isAtlas ? '☁️  Atlas (Production)' : '💻 Local MongoDB'}`);

        // Quick DB Stats
        try {
            const batchCount = await mongoose.model('Batch').countDocuments();
            const studentCount = await mongoose.model('Student').countDocuments();
            const userCount = await mongoose.model('User').countDocuments();
            console.log(`   🔸 Stats:   ${batchCount} Batches | ${studentCount} Students | ${userCount} Users`);
        } catch (e) {
            console.log(`   🔸 Stats:   Checking...`);
        }

        console.log('\n📡 [DATABASE: SUPABASE]');
        try {
            const { error } = await supabase.from('users').select('id').limit(1);
            if (!error) {
                console.log(`   🔸 Status:  ✅ Connected successfully`);
            } else {
                console.log(`   🔸 Status:  ❌ Connection Failed (${error.message || 'Unknown error'})`);
            }
        } catch (e) {
            console.log(`   🔸 Status:  ❌ Connection Failed`);
        }

        app.listen(PORT, () => {
            console.log('\n🚀 [SERVER]');
            console.log(`   🔹 URL:     http://localhost:${PORT}`);
            console.log(`   🔹 API:     http://localhost:${PORT}/api/health`);
            console.log(`   🔹 CORS:    Enabled for localhost 3000 & 5173`);

            console.log('\n⚙️  [MODULES LOADEAD]');
            console.log(`   ✔️  Auth & Users`);
            console.log(`   ✔️  Schools & Batches & Students`);
            console.log(`   ✔️  Attendance & Assignments & Feedback`);
            console.log(`   ✔️  Notifications & Class Planner & Audit Logs`);

            // ─── CRON SCHEDULER ──────────────────────────────────────────
            console.log('\n⏳ [BACKGROUND JOBS]');
            cron.schedule('0 10 * * *', async () => {
                console.log(`\n[${new Date().toLocaleString()}] 🔄 Automatically Syncing Supabase Data...`);
                try {
                    const stats = await syncRouter.runSync();
                    console.log(`   ✅ Sync Complete! Added ${stats.studentsAdded} students, ${stats.batchesAdded} batches.`);
                } catch (error) {
                    console.error(`   ❌ Sync Failed:`, error.message);
                }
            });
            console.log('   ⏱️  Sync Data job scheduled  -> 10:00 AM daily');

            console.log('\n=================================================\n');
        });
    })
    .catch(err => {
        console.error('\n❌ [DATABASE ERROR] Failed to connect to MongoDB:');
        console.error(err.message);
        console.log('\n');
        process.exit(1);
    });

// Just a test to force nodemon restart
console.log('');
