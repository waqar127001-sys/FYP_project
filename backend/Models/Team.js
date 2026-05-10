const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    creatorName: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    memberNames: [{ type: String }],
    
    // ✅ New fields for supervisor
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    supervisorName: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
