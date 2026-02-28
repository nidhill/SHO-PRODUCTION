const mongoose = require('mongoose');
const User = require('./server/models/User');
const School = require('./server/models/School');
require('dotenv').config({ path: './server/.env' });

async function verify() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sho-dashboard');

    const user = await User.findOne({ email: 'sho@sho.com' }).populate('assignedSchools');
    console.log("SHO user assigned schools populated:", user.assignedSchools.map(s => s.name));

    const userUnpopulated = await User.findOne({ email: 'sho@sho.com' });
    console.log("SHO user assigned schools raw:", userUnpopulated.assignedSchools);

    const filter = { isActive: true, _id: { $in: userUnpopulated.assignedSchools || [] } };
    const schools = await School.find(filter);
    console.log("Schools returned by API filter:", schools.map(s => s.name));

    mongoose.disconnect();
}

verify();
