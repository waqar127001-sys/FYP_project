import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ setActiveModule }) => {
  const navigate = useNavigate();

  // State variables for fetching actual data
  const [taskSummary, setTaskSummary] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [showTeamModal, setShowTeamModal] = useState(false); // ✅ for Team Modal
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");

  const [teamSubject, setTeamSubject] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [allTeams, setAllTeams] = useState([]);
  const [yourTeams, setYourTeams] = useState([]);
  const [otherTeams, setOtherTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("myTeams");
  const [showManageTeamsModal, setShowManageTeamsModal] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState({
  id: "",
  name: "",
});

  const myTeams = ["Team A", "Team B", "Team C"];
  const [showAllTeamModal, setShowAllTeamModal] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const userId = loggedInUser.id; // ✅ Get user ID
  const userName = loggedInUser.name;

  const openModal = () => {
    setIsModalOpen(true);
    setActiveTab("myTeams"); // Default tab
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users`);
      setUsers(response.data);
      console.log("Users fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const fetchSupervisors = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/supervisors`
      );
      setSupervisors(response.data.supervisors);
      console.log("Supervisors fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSupervisors();
    fetchDashboardData();
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/teams`);
      const teams = response.data.teams;

      const your = teams.filter((team) =>
        team.members.some((member) => member._id === userId)
      );

      const others = teams.filter(
        (team) => !team.members.some((member) => member._id === userId)
      );

      console.log("my teams>>>", your);
      console.log("other teams>>>", others);

      setAllTeams(teams);
      setYourTeams(your);
      setOtherTeams(others);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      // Fetch task summary
      const taskSummaryResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/dashboard/task-summary?userId=${userId}`
      );

      // Convert response to JSON
      const taskSummaryData = await taskSummaryResponse.json();

      console.log("taskSummaryResponse >>>>>>", taskSummaryData);
      // Set state with JSON data
      setTaskSummary(taskSummaryData);

      // Fetch leaderboard data
      const leaderboardResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/dashboard/leaderboard`
      );
      console.log("leaderboardResponse.data>>>>>>", leaderboardResponse.data);
      setLeaderboard(leaderboardResponse.data);

      // Fetch recent tasks
      const recentTasksResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/dashboard/recent-tasks`
      );
      console.log("recentTasksResponse>>>>>>", recentTasksResponse.data);
      setRecentTasks(recentTasksResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Handle team creation
 const handleCreateTeam = async () => {
  try {
    const allMemberIds = [
      userId,
      ...selectedUsers.map((user) => user.id),
    ];

    const allMemberNames = [
      userName,
      ...selectedUsers.map((user) => user.name),
    ];

    const payload = {
      subject: teamSubject,
      memberIds: allMemberIds,
      memberNames: allMemberNames,
      createdBy: userId,
      creatorName: userName,
      supervisorId: selectedSupervisor.id,     // ✅ supervisor ID
      supervisorName: selectedSupervisor.name // ✅ supervisor Name
    };

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/auth/create-team`,
      payload
    );

    if (response.data.success) {
      alert("Team created successfully!");
      setShowTeamModal(false);
      setTeamSubject("");
      setSelectedUsers([]);
      setSelectedSupervisor({ id: "", name: "" }); // ✅ reset supervisor
    }
  } catch (error) {
    console.error("Error creating team:", error);
  }
};


  // Prepare data for the chart
  const taskProgressData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"], // Labels should match data length
    datasets: [
      {
        label: "Completed Tasks",
        data: [taskSummary.completedTasks, 2, 10, 1], // Convert number to array
        borderColor: "#28a745",
        backgroundColor: "rgba(40, 167, 69, 0.2)",
        tension: 0.4,
      },
      {
        label: "Pending Tasks",
        data: [taskSummary.pendingTasks, 3, 2, 0], // Convert number to array
        borderColor: "#ff5733",
        backgroundColor: "rgba(255, 87, 34, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Task Progress Over Time" },
    },
  };
  const handleManageTeamsClick = () => {
    setShowManageTeamsModal(true);
  };

  return (
    <div className={styles.dashboard_container}>
      {/* 🛠️ Create Team Modal */}
      {showTeamModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <h2>Create New Team</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowTeamModal(false)}
              >
                ❌
              </button>
            </div>

          

            {/* Modal Body */}
            <div className={styles.modalBody}>
                <label className={styles.modalLabel}>Select Supervisor:</label>
            <select
  value={selectedSupervisor.id}
  onChange={(e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    setSelectedSupervisor({
      id: e.target.value,
      name: selectedOption.text,
    });
  }}
  className={styles.modalSelect}
>
  <option value="">-- Select Supervisor --</option>
  {supervisors.map((supervisor) => (
    <option key={supervisor._id} value={supervisor._id}>
      {supervisor.name}
    </option>
  ))}
</select>

              <label className={styles.modalLabel}>Subject:</label>
              <input
                type="text"
                placeholder="Enter Subject Name"
                value={teamSubject}
                onChange={(e) => setTeamSubject(e.target.value)}
                className={styles.modalInput}
              />

              <label className={styles.modalLabel}>Select Team Members:</label>
              <select
                multiple
                value={selectedUsers.map((user) => user.id)}
                onChange={(e) => {
                  const selectedOptions = Array.from(
                    e.target.selectedOptions
                  ).map((option) => ({
                    id: option.value,
                    name: option.getAttribute("data-name"),
                  }));
                  setSelectedUsers((prevSelected) => {
                    const newSelected = [...prevSelected];
                    selectedOptions.forEach((option) => {
                      if (!newSelected.some((user) => user.id === option.id)) {
                        newSelected.push(option);
                      }
                    });
                    return newSelected;
                  });
                }}
                className={styles.modalSelect}
              >
                {users.map((user) => (
                  <option key={user._id} value={user._id} data-name={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>

              {/* Selected Members Preview */}
              {selectedUsers.length > 0 && (
                <div className={styles.selectedUsers}>
                  {selectedUsers.map((user) => (
                    <span key={user.id} className={styles.selectedUserBadge}>
                      {user.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowTeamModal(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                className={styles.createButton}
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* <h1 className={styles.title}>Dashboard</h1> */}

      {/* 📊 Task Summary & Graph Layout */}
      <div className={styles.overview_section}>
        {/* 📌 Task Summary */}
        <div className={styles.task_summary}>
          <div className={styles.card}>
            <h2>Total Tasks</h2>
            <p>{taskSummary.totalTasks}</p>
          </div>
          <div className={styles.card}>
            <h2>Completed</h2>
            <p>{taskSummary.completedTasks}</p>
          </div>
          <div className={styles.card}>
            <h2>Pending</h2>
            <p>{taskSummary.pendingTasks}</p>
          </div>
        </div>

        {/* 📈 Task Progress Graph */}
        <div className={styles.chart_container}>
          <Line data={taskProgressData} options={options} />
        </div>
      </div>

      {/* 🏆 Leaderboard Section */}
      <div className={styles.leaderboard}>
        <h2>Top Performers</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Tasks Completed</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr key={user.userId}>
                <td>#{index + 1}</td>
                <td>{user.userName}</td>
                <td>{user.completedProjects}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📌 Recent Tasks Section */}
      <div className={styles.recent_tasks}>
        <h2>Recent Tasks</h2>
        <ul>
          {recentTasks.map((task) => (
            <li key={task.id}>
              <span>{task.title}</span>
              {/* <button
                className={styles.view_details}
                onClick={() => navigate(`/task/${task.id}`)}
              >
                View Details
              </button> */}
            </li>
          ))}
        </ul>
      </div>
      {/* Modal ko yahan conditionally render karenge */}
      {showManageTeamsModal && (
        <div className={styles.teammodalOverlay}>
          <div className={styles.teammodalContent}>
            {/* Close Button */}
            <button
              className={styles.closeButton}
              onClick={() => setShowManageTeamsModal(false)}
            >
              ❌
            </button>

            {/* Top Buttons */}
            <div className={styles.tabButtons}>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "myTeams" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("myTeams")}
              >
                My Teams
              </button>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "otherTeams" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("otherTeams")}
              >
                Other Teams
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.teammodalBody}>
              {activeTab === "myTeams" && (
                <div className={styles.teamList}>
                  {yourTeams.length > 0 ? (
                    yourTeams.map((team) => (
                      <div key={team._id} className={styles.teamCard}>
                        <h3>{team.subject}</h3>
                        <p>
                          <strong>Subject:</strong> {team.subject}
                        </p>
                        <p>
                          <strong>Members ({team.members.length}):</strong>
                        </p>

                        <div className={styles.memberList}>
                          {team.members.map((member) => (
                            <div key={member._id} className={styles.memberItem}>
                              <span className={styles.memberIcon}>👤</span>
                              <span className={styles.memberName}>
                                {member.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No teams found.</p>
                  )}
                </div>
              )}

              {activeTab === "otherTeams" && (
                <div className={styles.teamList}>
                  {otherTeams.length > 0 ? (
                    otherTeams.map((team) => (
                      <div key={team._id} className={styles.teamCard}>
                        <h3>{team.subject}</h3>
                        <p>
                          <strong>Subject:</strong> {team.subject}
                        </p>
                        <p>
                          <strong>Members ({team.members.length}):</strong>
                        </p>

                        <div className={styles.memberList}>
                          {team.members.map((member) => (
                            <div key={member._id} className={styles.memberItem}>
                              <span className={styles.memberIcon}>👤</span>
                              <span className={styles.memberName}>
                                {member.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No teams found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ⚡ Quick Actions */}
      <div className={styles.actions}>
        <button
          className={styles.create_task}
          onClick={() => setActiveModule("CreateTask")}
        >
          ➕ Create Task
        </button>
        <button
          className={styles.manage_teams}
          onClick={() => handleManageTeamsClick(true)}
        >
          👥 Manage Teams
        </button>
        <button
          className={styles.create_team}
          onClick={() => setShowTeamModal(true)}
        >
          🛠️ Create Team
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
