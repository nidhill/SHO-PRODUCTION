require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sho_app';

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existing = await User.findOne({ email: 'admin@demo.com' });
        if (existing) {
            console.log('Admin user already exists, skipping seed.');
            process.exit(0);
        }

        // Create default admin user
        await User.create({
            name: 'Admin',
            email: 'admin@demo.com',
            password: 'password',
            role: 'sho',
            phone: '9876543210',
            isActive: true
        });

        console.log('✅ Seed complete! Default admin created:');
        console.log('   Email:    admin@demo.com');
        console.log('   Password: password');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
}

seed();
