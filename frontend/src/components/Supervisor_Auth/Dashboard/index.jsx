import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

const SupervisorDashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    studentsAssigned: 0,
    totalTasks: 0,
    completedTasks: 0,
  });

  const [supervisor, setSupervisor] = useState({
    name: "",
    email: "",
    department: "",
    avatar: "",
  });
  const storedSupervisor = localStorage.getItem("supervisorData");
  const parsedSupervisor = JSON.parse(storedSupervisor);
  const supervisorId = parsedSupervisor._id;

  useEffect(() => {
    const storedSupervisor = localStorage.getItem("supervisorData");
    if (storedSupervisor) {
      const parsedSupervisor = JSON.parse(storedSupervisor);
      setSupervisor({
        name: parsedSupervisor.name || "",
        email: parsedSupervisor.email || "",
        department: parsedSupervisor.department || "",
        avatar: parsedSupervisor.avatar || "",
      });
    }
  }, []);

  console.log("supervisor ID>>>", supervisorId);

  useEffect(() => {

    if (supervisorId) {
      fetchStats(supervisorId);
    }
  }, []);

  const fetchStats = async (supervisorId) => {
    try {
      const [projectRes, teamsRes] = await Promise.all([
        axios.get(
          `http://localhost:8000/auth/assigned-projects/stats/${supervisorId}`
        ),
        axios.get("http://localhost:8000/auth/teams"),
      ]);

      const assignedProjects = projectRes.data.projects;
      const teams = teamsRes.data.teams;

      // 🧠 Sum of all students assigned (based on groupId -> team.members.length)
      let totalStudentsAssigned = 0;
      assignedProjects.forEach((project) => {
        const group = teams.find((team) => team._id === project.groupId);
        if (group && Array.isArray(group.members)) {
          totalStudentsAssigned += group.members.length;
        }
      });
      console.log("total project>>",projectRes.data.total);
      console.log("total students>>",totalStudentsAssigned);
      console.log("total task>>",projectRes.data.total);
      console.log("total completed>>",projectRes.data.complete);


      setStats({
        totalProjects: projectRes.data.total,
        studentsAssigned: totalStudentsAssigned,
        totalTasks: projectRes.data.total, // can be adjusted if you track real tasks
        completedTasks: projectRes.data.complete,
      });
    } catch (error) {
      console.error("❌ Error fetching full stats:", error);
    }
  };

  const taskData = {
    labels: [
      "Start",
      "10%",
      "20%",
      "30%",
      "40%",
      "50%",
      "60%",
      "70%",
      "80%",
      "90%",
      "100%",
    ],
    datasets: [
      {
        label: "Tasks Progress",
        data: Array.from({ length: 11 }, (_, i) =>
          Number((stats.completedTasks * (i / 10)).toFixed(1))
        ),
        fill: false,
        borderColor: "#10b981",
        tension: 0.4,
      },
    ],
  };

  const projectData = {
    labels: ["Total", "Pending", "Complete"],
    datasets: [
      {
        label: "Project Stats",
        data: [
          stats.totalProjects,
          stats.totalProjects - stats.completedTasks,
          stats.completedTasks,
        ],
        backgroundColor: ["#3b82f6", "#facc15", "#22c55e"],
        borderColor: ["#2563eb", "#eab308", "#15803d"],
        borderWidth: 1,
      },
    ],
  };

  const usersData = {
    labels: ["Total Students Assigned"],
    datasets: [
      {
        label: "Students Assigned",
        data: [stats.studentsAssigned],
        backgroundColor: ["#f97316"],
        borderColor: ["#ea580c"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Supervisor Dashboard</h2>

      {/* Profile Card */}
      {/* <div className={styles.profileCard}>
        <img src={supervisor.avatar} alt="Avatar" className={styles.avatar} />
        <div className={styles.info}>
          <h3>{supervisor.name}</h3>
          <p><strong>Department:</strong> {supervisor.department}</p>
          <p><strong>Email:</strong> {supervisor.email}</p>
        </div>
      </div> */}
      <div className={styles.profileCard}>
        <div className={styles.simpleAvatar}>
          {supervisor.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()}
        </div>
        <div className={styles.info}>
          <h3>{supervisor.name}</h3>
          <p>
            <strong>Department:</strong> {supervisor.department}
          </p>
          <p>
            <strong>Email:</strong> {supervisor.email}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsGrid}>
        <div className={styles.statBox}>
          <h4>Total Projects</h4>
          <p>{stats.totalProjects}</p>
        </div>
        <div className={styles.statBox}>
          <h4>Students Assigned</h4>
          <p>{stats.studentsAssigned}</p>
        </div>
        <div className={styles.statBox}>
          <h4>Pending Projects</h4>
          <p>{stats.totalTasks}</p>
        </div>
        <div className={styles.statBox}>
          <h4>Completed Projects</h4>
          <p>{stats.completedTasks}</p>
        </div>
      </div>

      {/* Graph Sections */}
      {/* <div className={styles.graphSection}>
        <h3>Tasks Progress Overview</h3>
        <div className={styles.chartWrapper}>
          <Line data={taskData} />
        </div>
      </div> */}

      <div className={styles.rowGraphs}>
        <div className={styles.chartSmallWrapper}>
          <h3>Projects Overview</h3>
          <Line data={projectData} />
        </div>

        <div className={styles.chartSmallWrapper}>
          <h3>Students Assigned Overview</h3>
          <Line data={usersData} />
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
