import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaUpload, FaFileAlt } from "react-icons/fa";
import styles from "./styles.module.css";

const ProjectTemplates = () => {
  /* ─── state ─── */
  const [templates, setTemplates] = useState([]);
  const [file, setFile]           = useState(null);
  const [title, setTitle]         = useState("");
  const [description, setDesc]    = useState("");
  const [uploading, setUploading] = useState(false);
  
 const loggedInUser = JSON.parse(localStorage.getItem("adminData"));
  const userId = loggedInUser._id;
  /* new state */
  const [projects, setProjects] = useState([]);
  const [groups, setGroups]     = useState([]);
  const [projectId, setProject] = useState("");
  const [groupId,   setGroup]   = useState("");

  const token = localStorage.getItem("token");
  

  /* ───────────────────────── 1.  load lists ───────────────────────── */
  useEffect(() => {
  const authHdr = { headers: { Authorization: `Bearer ${token}` } };

  (async () => {
    try {
      // Fetch templates
      const tplRes = await axios.get("http://localhost:8000/auth/templates", authHdr);
      const allTemplates = tplRes.data.templates || tplRes.data;

     

      // Filter templates where assignedBy matches loggedInUserId
      const filteredTemplates = allTemplates.filter(tpl => tpl.assignedBy === userId);
      setTemplates(filteredTemplates);

      // Fetch projects
      const projRes = await axios.get("http://localhost:8000/auth/projects", authHdr);
      setProjects(projRes.data.projects || projRes.data);

      // Fetch student groups / teams
      const grpRes  = await axios.get("http://localhost:8000/auth/teams", authHdr);
   
      setGroups(grpRes.data.teams || grpRes.data);

    } catch (err) {
      console.error("Init fetch failed", err);
      alert("Could not load data – see console.");
    }
  })();
}, [token]);  // Include user.id in deps if it's coming from state


  /* ───────────────────────── 2.  upload ───────────────────────── */
  const handleUpload = async (e) => {
    e.preventDefault();

if (!file || !title.trim() || !description.trim() || !projectId || !groupId) {
  return alert("Please choose file, fill all fields & pick project + group.");
}

    const formData = new FormData();
    formData.append("template", file);       // field name must match multer
    formData.append("title", title);
    formData.append("description", description);
    formData.append("projectId", projectId);
    formData.append("groupId",   groupId);
    formData.append("assignBy",   userId);


    try {
      console.log("form Data>>>",[...formData.entries()]);

      setUploading(true);
      await axios.post(
        "http://localhost:8000/auth/templates/upload",
        formData,
        { headers: {
  "Content-Type": "multipart/form-data",  // works, but not necessary
  Authorization: `Bearer ${token}`
} }
      );

      /* refresh list */
      const { data } = await axios.get("http://localhost:8000/auth/templates", {
  headers: { Authorization: `Bearer ${token}` }, // Fixed template literal
});

// If the templates are wrapped in a `templates` key, unwrap them
const templates = data.templates || data;

// Filter templates where assignedBy matches loggedInUserId
const filteredTemplates = templates.filter(tpl => tpl.assignedBy === userId);

setTemplates(filteredTemplates);

      /* reset */
      setFile(null);
      setTitle(""); setDesc("");
      setProject(""); setGroup("");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed – see console.");
    } finally {
      setUploading(false);
    }
  };

  /* ───────────────────────── 3.  delete ───────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await axios.delete(`http://localhost:8000/auth/templates/del/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed – see console.");
    }
  };


  /* ───────────────────────── 4.  UI ───────────────────────── */
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>Project Templates</h1>

      <form onSubmit={handleUpload} className={styles.uploadForm}>

        

        {/* project dropdown */}
        <label>Project
          <select
            className={styles.select}
            value={projectId}
            onChange={(e) => setProject(e.target.value)}
          >
            <option value="">— select project —</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </label>

        {/* group dropdown */}
        <label>Group
          <select
            className={styles.select}
            value={groupId}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">— select group —</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>{g.subject}</option>
            ))}
          </select>
        </label>
<label>
  Title
  <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className={styles.titleInput}
    
    placeholder="Enter document title"
  />
</label>

<label>
  Description
  <textarea
    value={description}
    onChange={(e) => setDesc(e.target.value)}
    className={styles.select}
    placeholder="Enter document description"
  />
</label>

        <label className={styles.fileInput}>
          <FaUpload /> Choose file
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        <button type="submit" disabled={uploading} >
          {uploading ? "Uploading…" : "Upload"}
        </button>
        {file && <span className={styles.selectedName}>{file.name}</span>}
      </form>

      {/* list */}
      <div className={styles.list}>
        {templates.length === 0 ? (
          <p className={styles.empty}>No templates uploaded yet.</p>
        ) : (
          templates.map((tpl) => (
            <div key={tpl._id} className={styles.card}>
              <FaFileAlt className={styles.icon} />
              <a href={tpl.fileUrl} target="_blank" rel="noopener noreferrer">
                {tpl.title}
              </a>
              <small>
                ({tpl.projectName} • {tpl.groupName})
              </small>
              <button
                className={styles.deleteBtn}
                title="Delete"
                onClick={() => handleDelete(tpl._id)}
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectTemplates;
