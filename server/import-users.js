const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://projectshaca_db_user:lb4jvml30OcaNLT7@sho-production.80hz8hz.mongodb.net/sho_app?retryWrites=true&w=majority';

const rawData = `
| swathi@harisandcoacademy.com            | SHO           |
| abishna@harisandcoacademy.com           | SALES         |
| sarangi@harisandcoacademy.com           | SHO           |
| anupriyam@harisandcoacademy.com         | SSHO          |
| bindujavs@harisandcoacademy.com         | SALES         |
| nahlakv@harisandcoacademy.com           | SHO           |
| sharafunneesakp@harisandcoacademy.com   | SHO           |
| safeeq@harisandcoacademy.com            | SALES_HEAD    |
| sanikac@harisandcoacademy.com           | SHO           |
| mohammednazilk@harisandcoacademy.com    | ADMIN         |
| nashida@harisandcoacademy.com           | SHO           |
| fathimahanna@harisandcoacademy.com      | SHO           |
| shahana@harisandcoacademy.com           | SSHO          |
| rihla@harisandcoacademy.com             | ACADEMIC_LEAD |
| sanika@harisandcoacademy.com            | SHO           |
| keerthana@harisandcoacademy.com         | SHO           |
| ayana@harisandcoacademy.com             | SHO           |
| rifa@harisandcoacademy.com              | SHO           |
| amitha@harisandcoacademy.com            | ACADEMIC_LEAD |
| liyahaca@gmail.com                      | SHO           |
| nidhap@harisandcoacademy.com            | SSHO          |
| fathimanihala@harisandcoacademy.com     | SHO           |
| anishaminnath@harisandcoacademy.com     | SHO           |
| devika@harisandcoacademy.com            | SHO           |
| spynazil789@gmail.com                   | SALES         |
| mohammednasidt@harisandcoacademy.com    | SALES_HEAD    |
| mohammedrashid@harisandcoacademy.com    | ACADEMIC_LEAD |
| rinu@harisandcoacademy.com              | SHO           |
| rifana@harisandcoacademy.com            | SALES         |
| neha@harisandcoacademy.com              | ACADEMIC_LEAD |
| ajayts@harisandcoacademy.com            | SALES         |
| jais@harisandcoacademy.com              | SALES         |
| femina@harisandcoacademy.com            | SALES_HEAD    |
| noufal@harisandcoacademy.com            | SALES         |
| jestymaria@harisandcoacademy.com        | SALES         |
| soorajtharakb@harisandcoacademy.com     | SALES         |
| sunaina@harisandcoacademy.com           | SALES         |
| saheel@harisandcoacademy.com            | CEO           |
| sanush@harisandcoacademy.com            | SALES         |
| athiras@harisandcoacademy.com           | SALES         |
| rakesh@harisandcoacademy.com            | SALES         |
| chinnu@harisandcoacademy.com            | SALES         |
| ashar@harisandcoacademy.com             | PROJECT_LEAD  |
| adithya@harisandcoacademy.com           | SALES         |
| rahmath@harisandcoacademy.com           | SALES         |
| manu@harisandcoacademy.com              | CEO           |
| karishma@harisandcoacademy.com          | SALES         |
| naseebabeegum@harisandco.com            | SALES         |
| nehaprakash209@gmail.com                | CEO           |
| deepa@harisandcoacademy.com             | SALES_HEAD    |
| muhammadazad@harisandcoacademy.com      | SALES         |
| nishana@harisandcoacademy.com           | SALES         |
| ayshafidha@harisandcoacademy.com        | SALES         |
| aflah@harisandcoacademy.com             | PROJECT_LEAD  |
| drishnak@harisandcoacademy.com          | SALES         |
| prayagjayaprakash@harisandcoacademy.com | SALES         |
| nabhan@harisandcoacademy.com            | PROJECT_LEAD  |
| muhammednk@harisandcoacademy.com        | SALES         |
| neelakantans@harisandcoacademy.com      | SALES_HEAD    |
| alaa@harisandcoacademy.com              | PROJECT_LEAD  |
| haritha@harisandcoacademy.com           | SALES         |
| vighneseks@harisandcoacademy.com        | SALES_HEAD    |
| shahanaasmi@harisandcoacademy.com       | SALES         |
| lithiya@harisandcoacademy.com           | SALES_HEAD    |
| anjushaji@harisandcoacademy.com         | SALES_HEAD    |
| fathimarinsha@harisandcoacademy.com     | SALES         |
| mmidu710@gmail.com                      | SHO           |
| jishna@harisandcoacademy.com            | SALES         |
| naseebabeegum@harisandcoacademy.com     | SALES         |
| ashif@harisandcoacademy.com             | PROJECT_LEAD  |
| remotebarber8@gmail.com                 | ACADEMIC_LEAD |
| faraan@harisandcoacademy.com            | PROJECT_LEAD  |
| sabin@harisandcoacademy.com             | SALES         |
| prajith@harisandcoacademy.com           | SALES         |
| muhmmdmidlaj@gmail.com                  | PENDING       |
| suminmamachan@harisandcoacademy.com     | SALES         |
| monisha@harisandcoacademy.com           | CEO           |
| sabiq@harisandcoacademy.com             | PROJECT_LEAD  |
| presslysoloman8128@gmail.com            | PROJECT_LEAD  |
| mrhimmystery@gmail.com                  | SALES         |
| tharun@harisand.co                      | PROJECT_LEAD  |
| saranya@harisandcoacademy.com           | SALES         |
`;

const roleMap = {
    'SHO': 'sho',
    'SSHO': 'ssho',
    'ACADEMIC_LEAD': 'academic',
    'LEADERSHIP': 'leadership',
    'ADMIN': 'admin',
    'MENTOR': 'mentor'
};

const DEFAULT_PASSWORD = 'Password@123'; // Default password

async function importUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for IMPORT");

        const lines = rawData.trim().split('\n');
        let imported = 0;
        let updated = 0;

        for (const line of lines) {
            const parts = line.split('|').map(s => s.trim()).filter(Boolean);
            if (parts.length >= 2) {
                const email = parts[0].toLowerCase();
                const rawRole = parts[1];
                const mappedRole = roleMap[rawRole];

                if (mappedRole) {
                    const name = email.split('@')[0];
                    let user = await User.findOne({ email });

                    if (!user) {
                        user = new User({
                            name,
                            email,
                            role: mappedRole,
                            password: DEFAULT_PASSWORD,
                            isActive: true
                        });
                        await user.save();
                        imported++;
                        console.log("Created: " + email + " as " + mappedRole);
                    } else {
                        user.role = mappedRole;
                        await user.save();
                        updated++;
                        console.log("Updated role: " + email + " as " + mappedRole);
                    }
                }
            }
        }

        console.log("Done! Created: " + imported + ", Updated: " + updated);
        console.log("All new users have password: " + DEFAULT_PASSWORD);
        process.exit(0);
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

importUsers();
