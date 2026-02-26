require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sho_app';

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const demoUsers = [
            { name: 'Demo SHO', email: 'sho@demo.com', role: 'sho' },
            { name: 'Demo Mentor', email: 'mentor@demo.com', role: 'mentor' },
            { name: 'Demo Leadership', email: 'leadership@demo.com', role: 'leadership' }
        ];

        for (const u of demoUsers) {
            const existing = await User.findOne({ email: u.email });
            if (!existing) {
                await User.create({
                    ...u,
                    password: 'password',
                    phone: '9876543210',
                    isActive: true
                });
                console.log(`Created demo user: ${u.email}`);
            } else {
                console.log(`User ${u.email} already exists.`);
            }
        }

        console.log('✅ Demo seed complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();
