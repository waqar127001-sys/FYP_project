const mongoose = require('mongoose');

const userProjectSummarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // reference to user
    required: true,
    ref: 'User',
  },
  userName: {
    type: String,
    required: true,
  },
  pendingProjects: {
    type: Number,
    default: 0,
  },
  completedProjects: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true // this adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('UserProjectSummary', userProjectSummarySchema);
