require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const School = require('./models/School');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sho-dashboard';

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clean slate for demo
        await User.deleteMany({});
        await School.deleteMany({});
        console.log('Cleared existing users and schools');

        // Create Schools
        const schoolsData = [
            { name: 'Tech School', address: 'Tech Campus', place: 'City', isActive: true },
            { name: 'Marketing School', address: 'Marketing Campus', place: 'City', isActive: true },
            { name: 'Design School', address: 'Design Campus', place: 'City', isActive: true },
            { name: 'Finance School', address: 'Finance Campus', place: 'City', isActive: true }
        ];

        const createdSchools = await School.insertMany(schoolsData);
        console.log('Created schools:', createdSchools.map(s => s.name).join(', '));

        const techSchool = createdSchools.find(s => s.name === 'Tech School');

        const demoUsers = [
            { name: 'Demo SHO', email: 'sho@demo.com', role: 'sho', assignedSchools: [techSchool._id] },
            { name: 'Demo SSHO', email: 'ssho@demo.com', role: 'ssho', assignedSchools: [techSchool._id] },
            { name: 'Demo Mentor', email: 'mentor@demo.com', role: 'mentor', assignedSchools: [techSchool._id] },
            { name: 'Demo Leadership', email: 'leadership@demo.com', role: 'leadership', assignedSchools: createdSchools.map(s => s._id) }
        ];

        for (const u of demoUsers) {
            const existing = await User.findOne({ email: u.email });
            if (!existing) {
                await User.create({
                    ...u,
                    password: 'password', // will be hashed by pre-save
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
