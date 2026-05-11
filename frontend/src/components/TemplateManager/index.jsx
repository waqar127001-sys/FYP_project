import React, { useEffect, useState } from "react";
import styles from "./TemplateManager.module.css";
import axios from "axios";

export default function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
	const userId = loggedInUser.id;

 useEffect(() => {
const fetchData = async () => {
  try {
    // 1. Fetch all teams
    const response = await axios.get("http://localhost:8000/auth/teams");
    const allTeams = response.data.teams;
    console.log("All Teams:", allTeams);

    // 2. Filter teams where user is a member
    const userGroups = allTeams.filter(team =>
      team.members && team.members.some(member => member._id === userId)
    );

    // 3. Extract group IDs
    const studentGroupIds = userGroups.map(group => group._id);
    console.log("User Group IDs:", studentGroupIds);

    // 4. Fetch all templates
    const templateRes = await axios.get("http://localhost:8000/auth/templates");
    const allTemplates = templateRes.data.templates;

    // 5. Filter templates assigned to the user’s groups
    const filteredTemplates = allTemplates.filter(template =>
      studentGroupIds.includes(template.groupId)
    );

    console.log("Filtered Templates:", filteredTemplates);
    setTemplates(filteredTemplates);

  } catch (err) {
    console.error("Error fetching data:", err);
  }
};



  fetchData();
}, [userId]);

  const handlePreview = (template) => setPreviewTemplate(template);
  const closePreview = () => setPreviewTemplate(null);

  return (
    <div className={styles.container}>
  <h1 className={styles.heading}>📂 Uploaded Templates</h1>

  {templates.length === 0 ? (
    <p className={styles.noTemplates}>🚫 No templates available.</p>
  ) : (
    <div className={styles.templateGrid}>
      {templates.map((template) => (
        <div key={template._id} className={styles.card}>
          <h3 className={styles.projectTitle}>{template.projectName}</h3>
          <p><strong>Group:</strong> {template.groupName}</p>
          <p><strong>File:</strong> {template.originalName}</p>
          <div className={styles.actions}>
            <button className={styles.viewBtn} onClick={() => handlePreview(template)}>👁 View</button>
            <a
              href={`http://localhost:8000${template.fileUrl}`}
              download={template.originalName}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.downloadBtn}
            >
              📥 Download
            </a>
          </div>
        </div>
      ))}
    </div>
  )}

  {previewTemplate && (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <span className={styles.closeButton} onClick={closePreview}>
          ❌
        </span>
        <h2>{previewTemplate.originalName}</h2>
        <iframe
          src={`https://docs.google.com/gview?url=${window.location.origin}${previewTemplate.fileUrl}&embedded=true`}
          width="100%"
          height="500px"
          title="Preview"
        ></iframe>
      </div>
    </div>
  )}
</div>

  );
}
