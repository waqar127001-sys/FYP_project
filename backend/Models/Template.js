// models/Template.js
const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    /* ─── Project context ─── */
    projectId:   { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    projectName: { type: String, required: true },   // denormalised for quick UI reads

    /* ─── Student‑group context ─── */
    groupId:     { type: mongoose.Schema.Types.ObjectId, ref: "StudentGroup", required: true },
    groupName:   { type: String, required: true },

    /* ─── File details ─── */
    fileName:    { type: String, required: true },   // stored file name on disk / S3
    originalName:{ type: String, required: true },   // what the admin uploaded
    fileType:    { type: String, enum: ["pdf", "docx", "pptx", "zip"], required: true },
    fileUrl:     { type: String, required: true },

    /* ─── Audit ─── */
    assignedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }          // gives createdAt & updatedAt
);

/* Helper: hide internal fields when sending to client */
templateSchema.methods.toPublic = function () {
  const {
    _id,
    projectId,
    projectName,
    groupId,
    groupName,
    fileName,
    originalName,
    fileType,
    fileUrl,
    assignedBy,
    createdAt,
  } = this.toObject({ versionKey: false });
  return {
    _id,
    projectId,
    projectName,
    groupId,
    groupName,
    fileName,
    originalName,
    fileType,
    fileUrl,
    assignedBy,
    createdAt,
  };
};

module.exports = mongoose.model("Template", templateSchema);
