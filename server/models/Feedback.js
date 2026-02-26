const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['student', 'batch', 'session', 'mentor', 'general'],
    required: true
  },
  // For student-specific feedback
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  // For batch/session feedback
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  },
  // Feedback given by
  givenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Feedback ratings
  ratings: {
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    understanding: {
      type: Number,
      min: 1,
      max: 5
    },
    participation: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  // Feedback comments
  comments: {
    type: String,
    required: true
  },
  // Areas of improvement
  areasOfImprovement: [String],
  // Strengths
  strengths: [String],
  // Session details (if applicable)
  sessionDetails: {
    date: Date,
    topic: String,
    sessionType: {
      type: String,
      enum: ['presentation', 'communication', 'personality_development', 'mock_interview', 'regular_class']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
