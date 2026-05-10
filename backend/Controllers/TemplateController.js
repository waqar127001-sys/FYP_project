// controllers/templateController.js
const Template       = require("../Models/Template");
const Project        = require("../Models/SupervisorModels/Project");
const StudentGroup   = require("../Models/Team");
const path           = require("path");
const fs             = require("fs");
const jwt = require("jsonwebtoken");
const User = require("../Models/Users");

/* ────────────────────────────────────────────────────────────
   GET  /api/templates             → list (most‑recent first)
   ──────────────────────────────────────────────────────────── */
exports.getAllTemplates = async (req, res) => {
  const templates = await Template.find().sort({ createdAt: -1 });
  res.json({ templates: templates.map((t) => t.toPublic()) });
};

/* ────────────────────────────────────────────────────────────
   POST /api/templates/upload
        body‑fields:  projectId, groupId
        file‑field :  template  (handled by multer)
   ──────────────────────────────────────────────────────────── */
exports.createTemplate = async (req, res) => {
  try {
    

    // 1️⃣ Validate required fields
    const { projectId, groupId, assignBy } = req.body;
    if (!projectId || !groupId || !assignBy) {
      throw new Error("Missing required fields (projectId, groupId, assignBy)");
    }
    if (!req.file) {
      throw new Error("No file uploaded");
    }

    // 2️⃣ Lookups
    const project = await Project.findById(projectId).lean();
    if (!project) throw new Error("Project not found");

    const group = await StudentGroup.findById(groupId).lean();
    if (!group) throw new Error("Student group not found");
console.log("grups>>",group);
    // 3️⃣ Extract file info
    const fileType = path.extname(req.file.originalname).slice(1); // removes the dot
    const fileUrl = `/uploads/templates/${req.file.filename}`;

    // 4️⃣ Save to DB
    const template = await Template.create({
      projectId,
      projectName: project.title || project.name,
      groupId,
      groupName: group.subject,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType,
      fileUrl,
      assignedBy: assignBy,
    });

    res.status(201).json({ template: template.toPublic() });

  } catch (err) {
    console.error("Template create error →", err.message);
    res.status(400).json({ error: err.message });
  }
};

/* ────────────────────────────────────────────────────────────
   PATCH /api/templates/:id
   ──────────────────────────────────────────────────────────── */
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    /* Only allow specific fields to be updated */
    const updatable = (({ projectId, groupId }) => ({ projectId, groupId }))(
      req.body
    );

    /* If they changed project/group, fetch names again */
    if (updatable.projectId) {
      const p = await Project.findById(updatable.projectId).lean();
      if (!p) throw new Error("Project not found");
      updatable.projectName = p.title || p.name;
    }
    if (updatable.groupId) {
      const g = await StudentGroup.findById(updatable.groupId).lean();
      if (!g) throw new Error("Group not found");
      updatable.groupName = g.name;
    }

    const updated = await Template.findByIdAndUpdate(id, updatable, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Not found" });

    res.json({ template: updated.toPublic() });
  } catch (err) {
    console.error("Template update error →", err);
    res.status(400).json({ error: err.message });
  }
};

/* ────────────────────────────────────────────────────────────
   DELETE /api/templates/:id
   ──────────────────────────────────────────────────────────── */
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const tpl = await Template.findByIdAndDelete(id);
    if (!tpl) return res.status(404).json({ error: "Not found" });

    /* remove local file (skip if using cloud storage) */
    const localPath = path.join(
      __dirname,
      "..",
      "uploads",
      "templates",
      tpl.fileName
    );
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Template delete error →", err);
    res.status(400).json({ error: err.message });
  }
};
