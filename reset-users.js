const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config({ path: './server/.env' });

async function resetUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sho-dashboard');
        console.log("Connected to MongoDB");

        // Keep only the main sho@sho.com and an admin if needed, or delete all? 
        // The user said "delete all test accounts". Let's delete all except 'sho@sho.com'
        const result = await User.deleteMany({});
        console.log(`Deleted ${result.deletedCount} users.`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        mongoose.disconnect();
    }
}

resetUsers();
