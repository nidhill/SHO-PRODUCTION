require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const School = require('./models/School');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sho-dashboard';

async function seedAcademy() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing
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

        // Users
        const usersData = [
            {
                name: 'Demo SHO',
                email: 'sho@sho.com',
                password: 'password', // will be hashed in pre-save hook
                role: 'sho',
                phone: '1234567890',
                assignedSchools: [techSchool._id],
                isActive: true
            },
            {
                name: 'Demo SSHO',
                email: 'ssho@sho.com',
                password: 'password',
                role: 'ssho',
                phone: '1234567891',
                assignedSchools: [techSchool._id],
                isActive: true
            },
            {
                name: 'Demo Mentor',
                email: 'mentor@sho.com',
                password: 'password',
                role: 'mentor',
                phone: '1234567892',
                assignedSchools: [techSchool._id],
                isActive: true
            },
            {
                name: 'Demo Leadership',
                email: 'leadership@sho.com',
                password: 'password',
                role: 'leadership',
                phone: '1234567893',
                assignedSchools: createdSchools.map(s => s._id), // Leadership usually sees all
                isActive: true
            }
        ];

        for (const u of usersData) {
            await User.create(u);
        }
        console.log('Created test accounts for sho, ssho, mentor, leadership');
        console.log('sho, ssho, mentor are assigned specifically to Tech School');

        console.log('✅ Academy seed complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seedAcademy();
