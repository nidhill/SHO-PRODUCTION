const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Photo
  photo: {
    type: String,
    required: false
  },
  // Personal Details
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  age: {
    type: Number,
    required: false
  },
  qualification: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  place: {
    type: String,
    required: false
  },
  mobileNumber: {
    type: String,
    required: true
  },
  parentGuardianNumber: {
    type: String,
    required: false
  },
  careerDreamsGoals: {
    type: String,
    required: false
  },

  // Batch Information
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: false
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: false
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'placed', 'interview_required', 'revoked'],
    default: 'active'
  },

  // Co-Curriculum Tracking
  coCurriculum: {
    presentationSessions: [{
      date: Date,
      topic: String,
      score: Number,
      feedback: String,
      attended: Boolean
    }],
    communicationSessions: [{
      date: Date,
      topic: String,
      score: Number,
      feedback: String,
      attended: Boolean
    }],
    personalityDevelopment: [{
      date: Date,
      topic: String,
      score: Number,
      feedback: String,
      attended: Boolean
    }],
    mockInterviews: [{
      date: Date,
      interviewer: String,
      score: Number,
      feedback: String,
      attended: Boolean
    }],
    reviews: [{
      date: Date,
      reviewer: String,
      overallScore: Number,
      comments: String,
      areasOfImprovement: [String]
    }]
  },

  // Attendance Summary
  attendanceSummary: {
    totalDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 }
  },

  // Assignment Summary
  assignmentSummary: {
    totalAssignments: { type: Number, default: 0 },
    completedAssignments: { type: Number, default: 0 },
    pendingAssignments: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },

  // Overall Performance
  overallPerformance: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
