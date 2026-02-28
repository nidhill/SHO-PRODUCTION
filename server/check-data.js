require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const School = require('./models/School');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sho-dashboard';

async function checkData() {
    try {
        await mongoose.connect(MONGODB_URI);

        const sho = await User.findOne({ email: 'sho@sho.com' }).populate('assignedSchools');
        console.log("SHO User Found:", sho ? "Yes" : "No");
        if (sho) {
            console.log("Assigned Schools count:", sho.assignedSchools.length);
            console.log("Assigned Schools data:", sho.assignedSchools);
        }

        const schools = await School.find();
        console.log("\nTotal Schools in DB:", schools.length);
        console.log(schools.map(s => s.name).join(', '));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}

checkData();
