const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['broadcast', 'individual', 'batch', 'group'],
    required: true
  },
  // Sender
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Recipients
  recipients: {
    // For broadcast - all students in assigned batches
    allStudents: {
      type: Boolean,
      default: false
    },
    // Specific batches
    batches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch'
    }],
    // Specific students
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    }],
    // Specific groups
    groups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    }]
  },
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Read status for each recipient
  readStatus: [{
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    readAt: {
      type: Date
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number
  }],
  // Schedule
  scheduledAt: {
    type: Date
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
