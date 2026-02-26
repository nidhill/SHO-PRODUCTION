const mongoose = require('mongoose');

const classPlannerSchema = new mongoose.Schema({
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  sessionType: {
    type: String,
    enum: ['regular', 'presentation', 'communication', 'personality_development', 'mock_interview', 'review', 'assessment'],
    default: 'regular'
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  conductedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled', 'postponed'],
    default: 'planned'
  },
  materials: [{
    name: String,
    type: String,
    url: String
  }],
  objectives: [String],
  outcomes: {
    type: String
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ClassPlanner', classPlannerSchema);
