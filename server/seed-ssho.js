require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sho_app';

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const existing = await User.findOne({ email: 'ssho@demo.com' });
        if (!existing) {
            await User.create({
                name: 'Demo SSHO',
                email: 'ssho@demo.com',
                password: 'password',
                role: 'ssho',
                phone: '9876543210',
                isActive: true
            });
            console.log('✅ Created demo user: ssho@demo.com');
        } else {
            console.log('✅ User ssho@demo.com already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();
