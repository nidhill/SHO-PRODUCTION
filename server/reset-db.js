require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sho_app';

async function resetAndSeed() {
    try {
        await mongoose.connect(MONGODB_URI, { dbName: 'sho_app' });
        console.log('✅ Connected to MongoDB Atlas cluster -> sho_app database');

        // Drop users to start completely fresh in sho_app
        await User.deleteMany({});
        console.log('🗑️ Deleted all old users in sho_app');

        const demoUsers = [
            { name: 'System Admin', email: 'admin@demo.com', role: 'sho' },
            { name: 'Demo SHO', email: 'sho@demo.com', role: 'sho' },
            { name: 'Demo SSHO', email: 'ssho@demo.com', role: 'ssho' },
            { name: 'Demo Mentor', email: 'mentor@demo.com', role: 'mentor' },
            { name: 'Demo Leadership', email: 'leadership@demo.com', role: 'leadership' }
        ];

        for (const u of demoUsers) {
            await User.create({
                ...u,
                password: 'password', // Will be hashed securely
                phone: '9876543210',
                isActive: true
            });
            console.log(`👤 Created demo user: ${u.email}`);
        }

        console.log('✨ Demo users seeded explicitly into sho_app database!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database reset failed:', error);
        process.exit(1);
    }
}

resetAndSeed();
