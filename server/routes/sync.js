const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const supabase = require('../config/supabase');
const School = require('../models/School');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const User = require('../models/User');

// Helper: fuzzy-match a name/email from Supabase to a User in MongoDB
async function findUserByName(nameOrEmail, roles) {
    if (!nameOrEmail) return null;
    const q = nameOrEmail.trim().toLowerCase();
    const users = await User.find({ role: { $in: roles }, isActive: true });

    // 1. Exact email match
    let found = users.find(u => u.email.toLowerCase() === q);
    if (found) return found;

    // 2. Exact name match
    found = users.find(u => u.name.toLowerCase() === q);
    if (found) return found;

    // 3. First word of name matches
    const firstWord = q.split(/[\s@.]+/)[0];
    if (firstWord.length > 2) {
        found = users.find(u => u.name.toLowerCase().startsWith(firstWord));
        if (found) return found;
    }

    // 4. Any meaningful word in name or email
    const words = q.split(/[\s@._]+/).filter(w => w.length > 3);
    for (const w of words) {
        found = users.find(u =>
            u.name.toLowerCase().includes(w) || u.email.toLowerCase().includes(w)
        );
        if (found) return found;
    }

    return null;
}

// GET /api/sync/upcoming
// Returns batches starting within the next 2 days with their students
router.get('/upcoming', verifyToken, async (req, res) => {
    try {
        const now = new Date();
        const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        const user = req.user;

        let filter = {
            startDate: { $gte: now, $lte: twoDaysLater },
            isActive: true
        };

        // Apply school scoping same as batches route
        const superRoles = ['admin', 'leadership', 'ceo_haca'];
        if (!superRoles.includes(user.role)) {
            if (['ssho', 'academic', 'pl'].includes(user.role) && user.assignedSchools?.length > 0) {
                filter.school = { $in: user.assignedSchools };
            } else if (user.school) {
                // SHO: resolve school string to ObjectId
                const schoolDoc = await School.findOne({
                    $or: [{ name: user.school }, { name: { $regex: user.school, $options: 'i' } }]
                });
                if (schoolDoc) filter.school = schoolDoc._id;
                else filter.school = null; // no match → return empty
            }
        }

        const batches = await Batch.find(filter)
            .populate('school', 'name')
            .populate('assignedSHO', 'name email role')
            .populate('assignedSSHO', 'name email role')
            .populate('assignedMentors', 'name email role');

        const result = [];
        for (const batch of batches) {
            const students = await Student.find({ batch: batch._id, isActive: true })
                .select('name email mobileNumber qualification');
            result.push({ ...batch.toObject(), students });
        }

        res.json({ success: true, batches: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// POST /api/sync
// Sync data from Supabase to MongoDB
async function runSync() {
    try {
        let syncStats = {
            usersAdded: 0,
            usersUpdated: 0,
            schoolsAdded: 0,
            batchesAdded: 0,
            studentsAdded: 0,
            studentsUpdated: 0,
            shoAssigned: 0,
            sshoAssigned: 0,
            studentsSkipped: 0
        };

        // Role map: Supabase role → MongoDB role
        const ROLE_MAP = {
            'SHO': 'sho',
            'SSHO': 'ssho',
            'ACADEMIC_LEAD': 'academic',
            'PROJECT_LEAD': 'pl',
            'ADMIN': 'admin',
            'CEO': 'ceo_haca',
            'SALES_HEAD': 'leadership',
            'PENDING': 'sho'   // default pending to SHO until confirmed
        };
        const SKIP_ROLES = ['SALES', 'PENDING'];  // don't sync pure sales staff as SHO users

        // 0. Sync Users from Supabase
        const { data: supabaseUsers, error: usersErr } = await supabase.from('users').select('*');
        if (usersErr) throw usersErr;

        for (const sUser of supabaseUsers) {
            const upperRole = (sUser.role || '').toUpperCase();
            if (SKIP_ROLES.includes(upperRole) || !ROLE_MAP[upperRole]) continue;

            const mongoRole = ROLE_MAP[upperRole];
            const email = sUser.email?.toLowerCase().trim();
            if (!email) continue;

            let existing = await User.findOne({ email });
            if (!existing) {
                // Create with a random default password (user can reset via forgot-password)
                const defaultPwd = Math.random().toString(36).slice(2, 10) + 'A@1';
                existing = await User.create({
                    name: sUser.name || email,
                    email,
                    password: defaultPwd,
                    role: mongoRole,
                    phone: sUser.phone || '',
                    school: sUser.school || '',
                    isActive: true
                });
                syncStats.usersAdded++;
            } else {
                // Update role, name, phone if changed
                let changed = false;

                // Protect existing admins/leadership from being downgraded by Supabase sync
                const isLocalSuper = ['admin', 'ceo_haca', 'leadership'].includes(existing.role);
                const isNewSuper = ['admin', 'ceo_haca', 'leadership'].includes(mongoRole);

                if (existing.role !== mongoRole) {
                    if (isLocalSuper && !isNewSuper) {
                        console.log(`[Sync] Skipped downgrading ${email} from ${existing.role} to ${mongoRole}`);
                    } else {
                        existing.role = mongoRole;
                        changed = true;
                    }
                }

                if (sUser.name && existing.name !== sUser.name) { existing.name = sUser.name; changed = true; }
                if (sUser.phone && existing.phone !== sUser.phone) { existing.phone = sUser.phone; changed = true; }

                // Don't override school for leadership/admin
                if (sUser.school && existing.school !== sUser.school && !isLocalSuper) {
                    existing.school = sUser.school;
                    changed = true;
                }

                if (changed) { await existing.save(); syncStats.usersUpdated++; }
            }
        }

        // 1. Sync Schools
        const { data: supabaseSchools, error: schoolErr } = await supabase.from('schools').select('*');
        if (schoolErr) throw schoolErr;

        for (const sSchool of supabaseSchools) {
            let school = await School.findOne({ $or: [{ code: sSchool.school_code }, { name: sSchool.name }] });
            if (!school) {
                school = await School.create({
                    name: sSchool.name,
                    code: sSchool.school_code,
                    address: sSchool.school || 'Unknown',
                    place: 'Unknown'
                });
                syncStats.schoolsAdded++;
            }
        }

        // 1b. Auto-assign SSHO to schools (1 SSHO per school, from Supabase users table)
        // Each SSHO in Supabase has a 'school' field (e.g. "Tech School")
        const sshoUsersInSupabase = (supabaseUsers || []).filter(u => u.role === 'SSHO' && u.school);
        for (const sshoData of sshoUsersInSupabase) {
            const schoolDoc = await School.findOne({
                $or: [
                    { name: sshoData.school },
                    { name: { $regex: sshoData.school, $options: 'i' } }
                ]
            });
            if (!schoolDoc) continue;

            const sshoUser = await User.findOne({ email: sshoData.email?.toLowerCase().trim(), role: 'ssho' });
            if (!sshoUser) continue;

            // Add school to SSHO's assignedSchools if not already there
            if (!sshoUser.assignedSchools.some(id => id.toString() === schoolDoc._id.toString())) {
                sshoUser.assignedSchools.push(schoolDoc._id);
                await sshoUser.save();
                syncStats.sshoAssigned++;
            }

            // Remove any OTHER SSHO from this school (1 SSHO per school rule)
            await User.updateMany(
                {
                    role: 'ssho',
                    _id: { $ne: sshoUser._id },
                    assignedSchools: schoolDoc._id
                },
                { $pull: { assignedSchools: schoolDoc._id } }
            );
        }

        // 2. Sync Batches (with SHO + SSHO auto-assignment)
        const { data: supabaseBatches, error: batchErr } = await supabase.from('batches').select('*');
        if (batchErr) throw batchErr;

        for (const sBatch of supabaseBatches) {
            let batch = await Batch.findOne({ $or: [{ code: sBatch.id }, { name: sBatch.name }] });

            // Resolve school reference
            let schoolRef = null;
            let schoolDoc = null;
            if (sBatch.school) {
                schoolDoc = await School.findOne({
                    $or: [{ name: sBatch.school }, { name: { $regex: sBatch.school, $options: 'i' } }]
                });
                if (schoolDoc) schoolRef = schoolDoc._id;
            }

            // Auto-match SHO by name from Supabase batches.sho_name
            const shoUser = await findUserByName(sBatch.sho_name, ['sho']);

            // Auto-find SSHO by school (each school has 1 SSHO)
            let sshoUser = null;
            if (schoolRef) {
                sshoUser = await User.findOne({
                    role: { $in: ['ssho', 'academic'] },
                    isActive: true,
                    assignedSchools: schoolRef
                });
                // Fallback: match by sho_name if no school-assigned SSHO found
                if (!sshoUser && sBatch.academic_lead) {
                    sshoUser = await findUserByName(sBatch.academic_lead, ['ssho', 'academic', 'pl']);
                }
            }

            if (!batch) {
                batch = await Batch.create({
                    name: sBatch.name,
                    code: sBatch.id,
                    startDate: sBatch.start_date ? new Date(sBatch.start_date) : new Date(),
                    status: 'active',
                    school: schoolRef,
                    assignedSHO: shoUser ? shoUser._id : undefined,
                    assignedSSHO: sshoUser ? sshoUser._id : undefined
                });
                syncStats.batchesAdded++;
                if (shoUser) syncStats.shoAssigned++;
                if (sshoUser) syncStats.sshoAssigned++;
            } else {
                // Update missing references
                let updated = false;
                if (!batch.school && schoolRef) { batch.school = schoolRef; updated = true; }
                if (!batch.assignedSHO && shoUser) { batch.assignedSHO = shoUser._id; updated = true; syncStats.shoAssigned++; }
                if (!batch.assignedSSHO && sshoUser) { batch.assignedSSHO = sshoUser._id; updated = true; syncStats.sshoAssigned++; }
                if (updated) await batch.save();

                // Also keep Batch reference on assigned SHO user
                if (shoUser) {
                    await User.findByIdAndUpdate(shoUser._id, { $addToSet: { assignedBatches: batch._id } });
                }
            }

            // Also keep Batch reference on SHO user's record
            if (shoUser && batch._id) {
                await User.findByIdAndUpdate(shoUser._id, { $addToSet: { assignedBatches: batch._id } });
            }
        }

        // 3. Sync Students — ONLY those with onboarding_completed = true
        const { data: supabaseStudents, error: studentErr } = await supabase
            .from('sales_enrollments')
            .select('*')
            .eq('onboarding_completed', true);
        if (studentErr) throw studentErr;

        for (const sStudent of supabaseStudents) {
            // Skip students with no email/phone
            if (!sStudent.student_email && !sStudent.student_phone) {
                syncStats.studentsSkipped++;
                continue;
            }

            let student = await Student.findOne({
                $or: [
                    ...(sStudent.student_email ? [{ email: sStudent.student_email.toLowerCase() }] : []),
                    ...(sStudent.student_phone ? [{ mobileNumber: sStudent.student_phone }] : [])
                ]
            });

            // Resolve Batch & School
            let batchRef = null;
            let schoolRef = null;

            if (sStudent.batch_id) {
                const batchDoc = await Batch.findOne({ code: sStudent.batch_id });
                if (batchDoc) {
                    batchRef = batchDoc._id;
                    schoolRef = batchDoc.school;
                }
            }

            if (!student) {
                student = await Student.create({
                    name: sStudent.student_name || 'Unknown',
                    email: sStudent.student_email
                        ? sStudent.student_email.toLowerCase()
                        : `${sStudent.student_phone}@noemail.com`,
                    mobileNumber: sStudent.student_phone || '0000000000',
                    batch: batchRef,
                    school: schoolRef,
                    status: 'active'
                });
                syncStats.studentsAdded++;
            } else {
                let updated = false;
                if (!student.batch && batchRef) { student.batch = batchRef; updated = true; }
                if (!student.school && schoolRef) { student.school = schoolRef; updated = true; }
                if (updated) {
                    await student.save();
                    syncStats.studentsUpdated++;
                }
            }
        }

        // 4. Update totalStudents count on each Batch
        const allBatches = await Batch.find();
        for (const b of allBatches) {
            const count = await Student.countDocuments({ batch: b._id, isActive: true });
            if (b.totalStudents !== count) {
                b.totalStudents = count;
                await b.save();
            }
        }

        return syncStats;
    } catch (error) {
        console.error('runSync Error:', error);
        throw error;
    }
}

// POST /api/sync endpoint
router.post('/', verifyToken, async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'leadership' && user.role !== 'admin' && user.role !== 'ceo_haca') {
            return res.status(403).json({ success: false, message: 'Not authorized to sync data' });
        }
        const stats = await runSync();
        res.json({ success: true, message: 'Sync complete', stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.runSync = runSync;
module.exports = router;
