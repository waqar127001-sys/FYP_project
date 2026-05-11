import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";

const AssignProjectForm = () => {
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const supervisorId = user?.id;

  useEffect(() => {
    fetchData();
    fetchAssignedProjects();
  }, []);

  const fetchData = async () => {
    try {
      const projectRes = await axios.get(`${process.env.REACT_APP_API_URL}/auth/projects`);
      const groupRes = await axios.get(`${process.env.REACT_APP_API_URL}/auth/teams`);

      setProjects(projectRes.data);
      setGroups(groupRes.data.teams);

      console.log("all groups???", groupRes);
      console.log("all project>>>", projectRes);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAssignedProjects = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/assigned-projects`
      );
      console.log("assigned projected>>>>>", res.data);
      setAssignedProjects(res.data);
    } catch (error) {
      console.error("Error fetching assigned projects:", error);
    }
  };

  const handleClickAssignment = (assignment) => {
    // Get full group & project details by matching IDs
    const fullGroup = groups.find(
      (group) => group._id === assignment.groupId._id
    );
    const fullProject = projects.find(
      (proj) => proj._id === assignment.projectId._id
    );

    // Merge full data into selectedAssignment
    setSelectedAssignment({
      ...assignment,
      groupDetails: fullGroup,
      projectDetails: fullProject,
    });

    setShowModal(true);
  };

  return (
    <>
      {/* Assigned Projects Section */}
      <div className={styles.projectListSection}>
        <h2 className={styles.heading}>Assigned Projects Overview</h2>
        {assignedProjects.length === 0 ? (
          <p className={styles.noProjects}>No assigned projects yet.</p>
        ) : (
          <ul className={styles.projectList}>
            {assignedProjects.map((item) => (
              <li
                className={styles.projectRow}
                key={item._id}
                onClick={() => handleClickAssignment(item)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.rowLeft}>
                  <h3 className={styles.projectTitle}>
                    {item.projectId?.title}
                  </h3>
                  <p className={styles.groupName}>
                    <span>📘 Group:</span> {item.groupId?.subject}
                  </p>
                </div>
                <div className={styles.rowRight}>
                  <p className={styles.supervisorName}>
                    <span>👨‍🏫 Supervisor:</span> {item.supervisorId?.name}
                  </p>
                  <p className={styles.date}>
                    <span>📅 Date:</span>{" "}
                    {new Date(item.assignedDate).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ Modal */}
    {showModal && selectedAssignment && (
  <div className={styles.backdrop}>
    <div className={styles.glassModal}>
      <div className={styles.modalTopBar}>
        <h2>📋 Assignment Overview</h2>
        <button onClick={() => setShowModal(false)} className={styles.closeBtn}>✖</button>
      </div>

      <div className={styles.sectionBlock}>
        <h3>📌 Project</h3>
        <p><span>📝</span> <strong>Title:</strong> {selectedAssignment.projectDetails?.title}</p>
        <p><span>📄</span> <strong>Description:</strong> {selectedAssignment.projectDetails?.description || "No description."}</p>
      </div>

      <div className={styles.sectionBlock}>
        <h3>👥 Group</h3>
        <p><span>📘</span> <strong>Subject:</strong> {selectedAssignment.groupDetails?.subject}</p>
        <strong>Members:</strong>
        <ul className={styles.bulletList}>
          {selectedAssignment.groupDetails?.memberNames?.map((name, index) => (
            <li key={index}><span>👤</span> {name}</li>
          ))}
        </ul>
      </div>

      <div className={styles.sectionBlock}>
        <h3>👨‍🏫 Supervisor</h3>
        <p><span>🙍‍♂️</span> <strong>Name:</strong> {selectedAssignment.supervisorId?.name}</p>
      </div>

      <div className={styles.sectionBlock}>
        <h3>📅 Assigned On</h3>
        <p><span>🕒</span> {new Date(selectedAssignment.assignedDate).toLocaleString()}</p>
      </div>
    </div>
  </div>
)}


    </>
  );
};

export default AssignProjectForm;
