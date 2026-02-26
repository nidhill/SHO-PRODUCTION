const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    attachments: [{
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimeType: String
    }],
    status: {
      type: String,
      enum: ['submitted', 'graded', 'late', 'resubmitted'],
      default: 'submitted'
    },
    score: {
      type: Number
    },
    feedback: {
      type: String
    },
    remarks: {
      type: String
    }
  }],
  totalMarks: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
