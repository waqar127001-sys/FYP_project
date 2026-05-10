const mongoose = require("mongoose");

const supervisorSchema = new mongoose.Schema({
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

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    default: null
  },

  department: {
    type: String,
    default: null
  },

  designation: {
    type: String,
    default: "Supervisor"
  },

  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
supervisorSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Supervisor || mongoose.model("Supervisor", supervisorSchema);
