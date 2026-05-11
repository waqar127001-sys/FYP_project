import React, { useEffect, useState } from "react";
import styles from "./styles.module.css"; // Update with actual path

const Navbar = ({ ShowModule, handleLogout }) => {
	const [username, setUsername] = useState("");

	useEffect(() => {
		// Retrieve username from sessionStorage
		const storedUser = sessionStorage.getItem("username");
		if (storedUser) {
			setUsername(storedUser);
		}
	}, []);

	return (
		<nav className={styles.navbar}>
			{/* Left - Greeting Message */}
			<div className={styles.greeting}>
				<span>
					👋 Hello, <strong>{username}</strong>
				</span>
			</div>

			{/* Center - Navigation Links */}
			<div className={styles.nav_links}>
				<button onClick={() => ShowModule("Dashboard")}>Dashboard</button>
				<button onClick={() => ShowModule("MyTasks")}>Progress</button>
				<button onClick={() => ShowModule("CreateTask")}>Tasks</button>
				<button onClick={() => ShowModule("TemplateManager")}>Templates</button>
				<button onClick={() => ShowModule("Settings")}>Notifications</button>
				<button onClick={() => ShowModule("Settings")}>Deadlines</button>
				<button onClick={() => ShowModule("AssignTask")}>Feedback & Review</button>
			</div>

			{/* Right Side - Auth Buttons */}
			<div className={styles.auth_buttons}>
				<button className={styles.logout} onClick={handleLogout}>
					Logout
				</button>
			</div>
		</nav>
	);
};

export default Navbar;
