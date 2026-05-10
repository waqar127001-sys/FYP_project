// AssignedProject.js (Mongoose Model)
const mongoose = require('mongoose');

const assignedProjectSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor', required: true },
  assignedDate: { type: Date, default: Date.now },
  status: { type: String, default: 'null' } // ✅ added status column
});

module.exports = mongoose.model('AssignedProject', assignedProjectSchema);
