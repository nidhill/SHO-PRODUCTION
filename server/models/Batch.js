const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  assignedSHO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedMentors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on_hold'],
    default: 'active'
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  averageAttendance: {
    type: Number,
    default: 0
  },
  averageFeedbackScore: {
    type: Number,
    default: 0
  },
  assignmentCompletionRate: {
    type: Number,
    default: 0
  },
  classSchedule: [{
    day: String,
    startTime: String,
    endTime: String,
    subject: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Batch', batchSchema);
