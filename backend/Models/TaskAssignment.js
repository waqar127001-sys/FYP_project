const mongoose = require("mongoose");

const TaskAssignmentSchema = new mongoose.Schema(
  {
    project: {
      type: String, // ✅ Changed from ObjectId to String
      required: true,
    },
    
    user: {
      type: String, // ✅ Changed from ObjectId to String
      required: true,
    },
    user_id: {
      type: String, // ✅ Changed from ObjectId to String
      required: true,
    },
    role: {
      type: String,
      enum: ["Developer", "Moderator", "Admin", "Tester", "Designer"],
      required: true,
    },
    assignedBy: {
      type: String, // ✅ Changed from ObjectId to String
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    assignedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskAssignment", TaskAssignmentSchema);
