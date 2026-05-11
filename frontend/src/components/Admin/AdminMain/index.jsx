import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "../AdminDashboard";

import AllUserGroups from "../Students";
import TemplateManager from "../TemplateManager";
import ChatBox from "../ChatBox";
import AssignProjectForm from "../AssignProject";
import Feedback from "../Feedbacks";
import ProjectApprovals from "../ProjectApproval";


// Icons
import { FaHome, FaTasks, FaUserGraduate, FaProjectDiagram, FaComments, FaSignOutAlt, FaFileUpload ,FaFileSignature } from "react-icons/fa";

const Main = ({ defaultModule = "Dashboard" }) => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(defaultModule);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
	const userData = localStorage.getItem("adminData");
	if (userData) {
	  try {
		const parsedUser = JSON.parse(userData);
		setStudentName(parsedUser.name);
		console.log("✅ Loaded data:", parsedUser);
	  } catch (error) {
		console.error("❌ Failed to parse user from localStorage", error);
	  }
	}
  }, []);

  useEffect(() => {
	setActiveModule(defaultModule);
  }, [defaultModule]);

  const handleLogout = () => {
	localStorage.removeItem("adminData");   // remove user info
	localStorage.removeItem("adminToken");  // remove token
	navigate("/");     // redirect to login
  };
  

  const ShowModule = (moduleName) => {
	setActiveModule(moduleName);
	// navigate(`/${moduleName}`);
  };

  return (
	/* ...inside your component's return */
<div className={styles.main_wrapper}>
  <aside className={styles.sidebar}>
    <div className={styles.sidebar_header}>
      <h2>Admin Panel</h2>
    </div>

    <nav className={styles.sidebar_nav}>
      <button
        onClick={() => ShowModule("Dashboard")}
        className={activeModule === "Dashboard" ? styles.active : ""}
      >
        <FaHome /> Dashboard
      </button>

      <button
        onClick={() => ShowModule("AllUserGroups")}
        className={activeModule === "AllUserGroups" ? styles.active : ""}
      >
        <FaUserGraduate /> Students
      </button>

      <button
        onClick={() => ShowModule("ProjectTemplates")}
        className={activeModule === "ProjectTemplates" ? styles.active : ""}
      >
        <FaFileUpload /> Project&nbsp;Templates
      </button>

      <button
        onClick={() => ShowModule("Projects")}
        className={activeModule === "Projects" ? styles.active : ""}
      >
        <FaProjectDiagram /> Projects
      </button>
  <button onClick={() => ShowModule("project-approval")} className={activeModule === "project-approval" ? styles.active : ""}>
  <FaFileSignature /> Project Approval
</button>
      <button
        onClick={() => ShowModule("ChatBox")}
        className={activeModule === "ChatBox" ? styles.active : ""}
      >
        
        <FaComments /> Chat
      </button>
        <button onClick={() => ShowModule("Feedback")} className={activeModule === "Feedback" ? styles.active : ""}>
                  <FaTasks /> Feedback
                </button> 

      <button onClick={handleLogout} className={styles.logout_btn}>
        <FaSignOutAlt /> Logout
      </button>
    </nav>
  </aside>

  <main className={styles.content_area}>
    {activeModule === "Dashboard"        && <AdminDashboard setActiveModule={setActiveModule} />}
    {activeModule === "AllUserGroups"    && <AllUserGroups />}
    {activeModule === "ProjectTemplates" && <TemplateManager />}   {/* new */}
    {activeModule === "Projects"   && <AssignProjectForm />}     
    {activeModule === "project-approval"   && <ProjectApprovals />}     
    {activeModule === "ChatBox"          && <ChatBox />}
    {activeModule === "Feedback" && <Feedback />} 
  </main>
</div>
  );
};

export default Main;
