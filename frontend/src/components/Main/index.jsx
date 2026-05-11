import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import Dashboard from "../Dashboard";
import CreateTask from "../CreateTask";
import AssignTask from "../AssignTask";
import MyTasks from "../MyTasks";
import TemplateManager from "../TemplateManager";
import ChatBox from "../ChatBox";
import Feedback from "../Feedbacks";
// import ManageTeams from "../Teams"; 



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

	// 👇 New useEffect to handle prop updates
	useEffect(() => {
		setActiveModule(defaultModule);
	}, [defaultModule]);

	const handleLogout = () => {
		localStorage.removeItem("user"); // 👈 remove user data from localStorage
		navigate("/"); // 👈 redirect to login page
	  };
	

	const ShowModule = (moduleName) => {
		setActiveModule(moduleName);
		navigate(`/student/${moduleName}`); // 👈 update URL
	};
	

	return (
		<div className={styles.main_container}>
			<nav className={styles.navbar}>
				<div style={{ fontSize: "36px", fontWeight: "1000", color: "white" }}>
					👋 Hello, <span style={{ fontWeight: "bold" }}>{studentName || "Student"}</span>
				</div>

				<div className={styles.nav_links}>
					<button onClick={() => ShowModule("Dashboard")}>Dashboard</button>
					<button onClick={() => ShowModule("my-tasks")}>Progress</button>
					<button onClick={() => ShowModule("create-tasks")}>Tasks</button>
					<button onClick={() => ShowModule("Template-manager")}>Templates</button>
					<button onClick={() => ShowModule("Chats")}>Chats </button>
					<button onClick={() => ShowModule("Feedback")}>Feedback & Review</button>
					{/* <button onClick={() => ShowModule("ManageTeams")}>Manage Teams</button> */}
					
				</div>
				

				<div className={styles.auth_buttons}>
					<button className={styles.logout} onClick={handleLogout}>
						Logout
					</button>
				</div>
			</nav>

			<div className={styles.module_container}>
				{activeModule === "Dashboard" && <Dashboard setActiveModule={setActiveModule} />}
				{activeModule === "MyTasks" && <MyTasks />}
				{activeModule === "CreateTask" && <CreateTask />}
				{activeModule === "AssignTask" && <AssignTask />}
				{activeModule === "Template-manager" && <TemplateManager />}

				{activeModule === "ChatBox" && <ChatBox />}
				{activeModule === "Feedback" && <Feedback />}
				{/* {activeModule === "ManageTeams" && <ManageTeams />} */}
				
			</div>
		</div>
	);
};

export default Main;
