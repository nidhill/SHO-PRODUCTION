const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const supabase = require('../config/supabase');
const School = require('../models/School');
const Batch = require('../models/Batch');
const Student = require('../models/Student');

// POST /api/sync
// Sync data from Supabase to MongoDB
router.post('/', verifyToken, async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'leadership' && user.role !== 'ceo_haca' && user.role !== 'head_academics') {
            return res.status(403).json({ success: false, message: 'Not authorized to sync data' });
        }

        let syncStats = {
            schoolsAdded: 0,
            batchesAdded: 0,
            studentsAdded: 0,
            studentsUpdated: 0
        };

        // 1. Sync Schools
        const { data: supabaseSchools, error: schoolErr } = await supabase.from('schools').select('*');
        if (schoolErr) throw schoolErr;

        for (const sSchool of supabaseSchools) {
            // Find by name or code to prevent duplicates
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

        // 2. Sync Batches
        const { data: supabaseBatches, error: batchErr } = await supabase.from('batches').select('*');
        if (batchErr) throw batchErr;

        for (const sBatch of supabaseBatches) {
            let batch = await Batch.findOne({ $or: [{ code: sBatch.id }, { name: sBatch.name }] });

            // Resolve school reference
            let schoolRef = null;
            if (sBatch.school) {
                // Try finding by name first, as in 'Design School'
                const schoolDoc = await School.findOne({ name: sBatch.school });
                if (schoolDoc) schoolRef = schoolDoc._id;
            }

            if (!batch) {
                batch = await Batch.create({
                    name: sBatch.name,
                    code: sBatch.id,
                    startDate: sBatch.start_date ? new Date(sBatch.start_date) : new Date(),
                    status: 'active',
                    school: schoolRef
                });
                syncStats.batchesAdded++;
            } else if (!batch.school && schoolRef) {
                batch.school = schoolRef;
                await batch.save();
            }
        }

        // 3. Sync Students
        const { data: supabaseStudents, error: studentErr } = await supabase.from('sales_enrollments').select('*');
        if (studentErr) throw studentErr;

        for (const sStudent of supabaseStudents) {
            let student = await Student.findOne({
                $or: [
                    { email: sStudent.student_email },
                    { mobileNumber: sStudent.student_phone }
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
            if (!schoolRef && sStudent.school_code) {
                const schoolDoc = await School.findOne({ code: sStudent.school_code });
                if (schoolDoc) schoolRef = schoolDoc._id;
            }

            if (!student) {
                student = await Student.create({
                    name: sStudent.student_name || 'Unknown',
                    email: sStudent.student_email || `${sStudent.student_phone}@noemail.com`,
                    mobileNumber: sStudent.student_phone || '0000000000',
                    batch: batchRef,
                    school: schoolRef,
                    status: 'active',
                    age: 20 // Default placeholder
                });
                syncStats.studentsAdded++;
            } else {
                // Update references if they were missing
                let updated = false;
                if (!student.batch && batchRef) { student.batch = batchRef; updated = true; }
                if (!student.school && schoolRef) { student.school = schoolRef; updated = true; }
                if (updated) {
                    await student.save();
                    syncStats.studentsUpdated++;
                }
            }
        }

        res.json({ success: true, message: 'Sync complete', stats: syncStats });
    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
