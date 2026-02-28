const mongoose = require('mongoose');
const User = require('./server/models/User');
const School = require('./server/models/School');
require('dotenv').config({ path: './server/.env' });

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sho-dashboard');

    const users = await User.find({ role: { $in: ['sho', 'ssho'] } });
    console.log("SHO/SSHO Users:");
    for (const u of users) {
        console.log(`- ${u.email} (${u.role}): ${u.assignedSchools.length} assigned schools`);
    }

    const schools = await School.find();
    console.log("\nSchools:");
    for (const s of schools) {
        console.log(`- ${s.name} (isActive: ${s.isActive}) id: ${s._id}`);
    }

    mongoose.disconnect();
}

check();
