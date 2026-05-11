    import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";

const PendingProjects = () => {
  const [pendingProjects, setPendingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
   const fetchPendingProjects = async () => {
  try {
    const [assignedRes, projectRes] = await Promise.all([
      axios.get("http://localhost:8000/auth/assigned-projects", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("http://localhost:8000/auth/projects", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const assigned = assignedRes.data;
    const projects = projectRes.data;

    // Merge deadline into assigned projects
    const enriched = assigned.map(assign => {
      const matchedProject = projects.find(p => p._id === assign.projectId._id);
      return {
        ...assign,
        deadline: matchedProject?.deadline || "N/A",
        title: matchedProject?.title || "Untitled",
        supervisorName: matchedProject?.supervisorName || "Unknown",
      };
    });

    const filtered = enriched.filter(p => p.status === "pending");
    console.log("Filtered projects with deadline:", filtered);
    setPendingProjects(filtered);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching or merging projects:", error);
    setLoading(false);
  }
};


    fetchPendingProjects();
  }, []);
  const handleDecision = async (projectId, decision) => {
  try {

    console.log("projectID>>>>",projectId);
    console.log("decision>>>>",decision);

    const response = await axios.put(
      `http://localhost:8000/auth/update-project-status/${projectId}`,
      { status: decision }, // "approved" or "rejected"
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Optimistically update UI without refetching
    setPendingProjects(prev =>
      prev.filter(project => project.projectId._id !== projectId)
    );

    alert(`Project ${decision === 'approved' ? 'Approved' : 'Rejected'} Successfully!`);
  } catch (error) {
    console.error(`${decision} failed:`, error);
    alert(`Failed to ${decision} project. Check console.`);
  }
};


  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>Pending Project Approvals</h2>

        {loading ? (
          <div className={styles.message}>Loading projects...</div>
        ) : pendingProjects.length === 0 ? (
          <div className={styles.message}>No pending projects found.</div>
        ) : (
          <div className={styles.cardGrid}>
            {pendingProjects.map(project => (
              <div key={project._id} className={styles.card}>
                <h3 className={styles.title}>{project.title}</h3>
                <p><strong>Group:</strong> {project.groupId?.subject || "N/A"}</p>
                <p><strong>Supervisor:</strong> {project.supervisorId?.name || "N/A"}</p>
                <p><strong>Deadline:</strong> {project.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}</p>
                <p className={styles.status}>Status: Waiting for Approval</p>

                <div className={styles.buttonGroup}>
  <button
    className={styles.approveBtn}
    onClick={() => handleDecision(project.projectId._id, "approved")}
  >
    Approve
  </button>
  <button
    className={styles.rejectBtn}
    onClick={() => handleDecision(project.projectId._id, "rejected")}
  >
    Reject
  </button>
</div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingProjects;
