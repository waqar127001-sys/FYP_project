import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import Dashboard from "../Dashboard";
import AssignProject from "../AssignProject";
import CreateProject from "../CreateProject";
import AllUserGroups from "../Students";
// import TemplateManager from "../TemplateManager";
import ChatBox from "../ChatBox";
import Feedback from "../Feedbacks";
import ProjectApprovals from "../ProjectApproval";
// import Students from "../Students";

// Icons
import { FaHome, FaTasks, FaUserGraduate, FaProjectDiagram, FaComments, FaSignOutAlt, FaClipboardList,FaFileSignature } from "react-icons/fa";

const Main = ({ defaultModule = "Dashboard" }) => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(defaultModule);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setStudentName(parsedUser.name);
        console.log("✅ Loaded student name:", parsedUser.name);
      } catch (error) {
        console.error("❌ Failed to parse user from localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    setActiveModule(defaultModule);
  }, [defaultModule]);

  const handleLogout = () => {
    localStorage.removeItem("supervisorData");   // remove user info
    localStorage.removeItem("token");  // remove token
    navigate("/");     // redirect to login
  };
  

  const ShowModule = (moduleName) => {
    setActiveModule(moduleName);
    // navigate(`/${moduleName}`);
  };

  return (
    <div className={styles.main_wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebar_header}>
          <h2>Supervisor Panel</h2>
        </div>
        <nav className={styles.sidebar_nav}>
          <button onClick={() => ShowModule("Dashboard")} className={activeModule === "Dashboard" ? styles.active : ""}>
            <FaHome /> Dashboard
          </button>
           <button onClick={() => ShowModule("CreateProject")} className={activeModule === "CreateProject" ? styles.active : ""}>
            <FaProjectDiagram /> Create Project
          </button>
           <button onClick={() => ShowModule("AssignProject")} className={activeModule === "AssignProject" ? styles.active : ""}>
            <FaClipboardList /> Assign Project
          </button> 
         
           <button onClick={() => ShowModule("project-approval")} className={activeModule === "project-approval" ? styles.active : ""}>
           <FaFileSignature /> Project Approval
         </button>
          <button onClick={() => ShowModule("AllUserGroups")} className={activeModule === "AllUserGroups" ? styles.active : ""}>
            <FaUserGraduate /> Students
          </button>
          <button onClick={() => ShowModule("ChatBox")} className={activeModule === "ChatBox" ? styles.active : ""}>
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
        {activeModule === "Dashboard" && <Dashboard setActiveModule={setActiveModule} />}
        {activeModule === "CreateProject" && <CreateProject />}
      {activeModule === "AssignProject" && <AssignProject />}
      {activeModule === "project-approval"   && <ProjectApprovals />}  
           {activeModule === "AllUserGroups" && <AllUserGroups />} 
        {activeModule === "ChatBox" && <ChatBox />}
       {activeModule === "Feedback" && <Feedback />} 
      </main>
    </div>
  );
};

export default Main;
