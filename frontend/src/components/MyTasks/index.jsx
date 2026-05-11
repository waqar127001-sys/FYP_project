import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaSearch,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [otherTasks, setOtherTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionNote, setSubmissionNote] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSubmitProject = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const submitProject = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/submit-project`,
        {
          taskId: selectedTask._id,
          userId: loggedInUser.id,
          note: submissionNote,
        }
      );

      fetchTasks(); // refresh tasks
      setIsModalOpen(false);
      setSubmissionNote("");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed. Please try again.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);
  //   console.log("loggedInUser",loggedInUser);
  if (!loggedInUser || !loggedInUser.id) {
    // ✅ Ensure _id is used
    alert("User not found. Please log in again!");
    return;
  }

  const userId = loggedInUser.id; // ✅ Get user ID

  const fetchTasks = async () => {
    try {
      // ✅ Corrected API URL (removed extra slash)
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/Myassigned-tasks?userId=${userId}`
      );
      const otherTasks = await axios.get(
       `${process.env.REACT_APP_API_URL}/auth/Otherassigned-tasks?userId=${userId}`
      );
      console.log("otherTasks", otherTasks.data);
      setOtherTasks(otherTasks.data);
      // console.log("userTasks", response.data);

      setTasks(response.data); // ✅ Set tasks state
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleRejectProject = async (task) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/reject-task/${task._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: task.user_id,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("❌ Task rejected!");
        // Refresh task list here
      } else {
        alert("❌ Rejection failed");
      }
    } catch (error) {
      console.error("Error rejecting task:", error);
    }
  };

  const handleApprovProject = async (task) => {
    try {
      const response = await fetch(
       `${process.env.REACT_APP_API_URL}/auth/approve-task/${task._id}`,
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: task.user_id, // 👈 sending user_id in request body
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("✅ Task approved!");
        // Refresh or re-fetch logic here
      } else {
        alert("❌ Approval failed");
      }
    } catch (error) {
      console.error("Error approving task:", error);
    }
  };

  const handleinspect = (task) => {
    setSelectedTask(task); // Store clicked task
    setShowModal(true); // Show the modal
  };

  const markTaskCompleted = (taskId) => {
    // Example API call or state update to mark the task as completed
    toggleTaskStatus(taskId, "Pending"); // Assuming toggleTaskStatus handles the update
    setShowModal(false); // Close the modal after the update
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const updatedStatus =
        currentStatus === "Pending" ? "Completed" : "Pending";
      await axios.put(`${process.env.REACT_APP_API_URL}/auth/update-task/${taskId}`, {
        status: updatedStatus,
      });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // const filteredTasks = tasks
  // .filter((task) => (filter === "All" ? true : task.status === filter))
  // ;

  // const filteredOtherTasks = otherTasks.filter(
  //   (task) => (filter === "All" ? true : task.status === filter) && task.assignedBy ===  userId
  // );

  const filteredTasks = tasks
    .filter((task) => (filter === "All" ? true : task.status === filter))
    .filter(
      (task) =>
        task.project.toLowerCase().includes(search.toLowerCase()) ||
        task.user.toLowerCase().includes(search.toLowerCase()) ||
        task.role.toLowerCase().includes(search.toLowerCase())
    );

  const filteredOtherTasks = otherTasks
    .filter(
      (task) =>
        (filter === "All" ? true : task.status === filter) &&
        task.assignedBy === userId
    )
    .filter(
      (task) =>
        task.project.toLowerCase().includes(search.toLowerCase()) ||
        task.user.toLowerCase().includes(search.toLowerCase()) ||
        task.role.toLowerCase().includes(search.toLowerCase())
    );

  // Get unique statuses dynamically
  const Mystatuses = [...new Set(filteredTasks.map((task) => task.status))]; // ✅ Unique statuses
  const Otherstatuses = [
    ...new Set(filteredOtherTasks.map((task) => task.status)),
  ];

  // console.log("Mystatuses",Mystatuses);
  // console.log("Otherstatuses",Otherstatuses);

  // Graph Data
  const MystatusCounts = Mystatuses.map(
    (status) => filteredTasks.filter((task) => task.status === status).length
  );
  const OtherstatusCounts = Otherstatuses.map(
    (status) =>
      filteredOtherTasks.filter((task) => task.status === status).length
  );
  const MypieData = {
    labels: Mystatuses, // ✅ Unique Status Labels
    datasets: [
      {
        data: MystatusCounts, // ✅ Correct Count Mapping
        backgroundColor: ["#4caf50", "#e67e22", "#2196F3", "#f39c12"],
      },
    ],
  };

  const OtherpieData = {
    labels: Otherstatuses, // ✅ Unique Status Labels
    datasets: [
      {
        data: OtherstatusCounts, // ✅ Correct Count Mapping
        backgroundColor: ["#4caf50", "#e67e22", "#2196F3", "#f39c12"],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
   <div className={styles.container}>
  {showModal && selectedTask && (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h2 className={styles.modalTitle}>🔍 Inspect Task</h2>
        <div className={styles.modalBody}>
          <p><strong>📁 Project:</strong> {selectedTask.project || "Unknown Project"}</p>
          <p><strong>👤 User:</strong> {selectedTask.user}</p>
          <p><strong>🧩 Role:</strong> {selectedTask.role}</p>
          <p><strong>📌 Status:</strong> {selectedTask.status}</p>
        </div>
        <div className={styles.modalActions}>
          <button
            className={styles.completeBtn}
            onClick={() => markTaskCompleted(selectedTask._id)}
          >
            ✅ Mark as Completed
          </button>
          <button
            className={styles.closeBtn}
            onClick={() => setShowModal(false)}
          >
            ❌ Close
          </button>
        </div>
      </div>
    </div>
  )}

  {isModalOpen && (
    <div className={styles.submitModalOverlay}>
      <div className={styles.submitModal}>
        <h3 className={styles.submitModalTitle}>
          🚀 Submit Project: {selectedTask?.project}
        </h3>

        <textarea
          placeholder="Add optional note or comments..."
          value={submissionNote}
          onChange={(e) => setSubmissionNote(e.target.value)}
          className={styles.submitNoteInput}
        />

        <div className={styles.submitModalActions}>
          <button onClick={submitProject} className={styles.submitConfirmBtn}>
            ✅ Submit
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className={styles.submitCancelBtn}
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  )}

  <div className={styles.taskActions}>
    <div className={styles.searchBox}>
      <FaSearch className={styles.searchIcon} />
      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchInput}
      />
    </div>

    <select
      className={styles.taskFilter}
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    >
      <option value="All">All</option>
      <option value="Pending">Pending</option>
      <option value="Completed">Completed</option>
    </select>
  </div>

  <div className={styles.graphs}>
    <div className={styles.chartContainer} style={{ width: "900px", height: "400px" }}>
      <h3>My Task Distribution</h3>
      <Pie data={MypieData} options={{ ...pieOptions, cutout: "50%" }} />
    </div>

    <div className={styles.chartContainer} style={{ width: "900px", height: "400px" }}>
      <h3>Others Task Distribution</h3>
      <Pie data={OtherpieData} options={{ ...pieOptions, cutout: "50%" }} />
    </div>
  </div>

  {/* ✅ My Task Distribution Section */}
  <h2>My Task Distribution</h2>
  {filteredTasks.length === 0 ? (
    <p className={styles.noTasksMsg}>🚫 No tasks found.</p>
  ) : (
    <ul className={styles.taskList}>
      {filteredTasks.map((task) => (
        <li key={task._id} className={styles.taskItem}>
          <div className={styles.taskInfo}>
            <h3 className={styles.taskTitle}>{task.project || "Unknown Project"}</h3>
            <p className={styles.taskDetails}>User: {task.user}</p>
            <p className={styles.taskDetails}>Role: {task.role}</p>
          </div>

          <div className={styles.statusActions}>
            <span
              className={`${styles.status} ${
                task.status === "Completed"
                  ? styles.completed
                  : task.status === "Rejected"
                  ? styles.rejected
                  : styles.pending
              }`}
              onClick={() => toggleTaskStatus(task._id, task.status)}
            >
              {task.status === "Completed" ? (
                <FaCheckCircle />
              ) : task.status === "Rejected" ? (
                <FaTimesCircle />
              ) : (
                <FaHourglassHalf />
              )}
              {task.status}
            </span>

            {task.status === "Approved" ? (
              <button className={styles.submitButton} disabled>
                🎉 Approved
              </button>
            ) : task.status === "Completed" ? (
              <button className={styles.submitButton} disabled>
                Waiting for Admin Approval
              </button>
            ) : task.status === "Rejected" ? null : (
              <button
                className={styles.submitButton}
                onClick={() => handleSubmitProject(task)}
              >
                Submit Project
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )}

  {/* ✅ Others Task Distribution Section */}
  <h2>Others Task Distribution</h2>
  {filteredOtherTasks.length === 0 ? (
    <p className={styles.noTasksMsg}>🚫 No tasks available for others.</p>
  ) : (
    <ul className={styles.taskList}>
      {filteredOtherTasks.map((task) => (
        <li key={task._id} className={styles.taskItem}>
          <div className={styles.taskInfo}>
            <h3 className={styles.taskTitle}>{task.project || "Unknown Project"}</h3>
            <p className={styles.taskDetails}>User: {task.user}</p>
            <p className={styles.taskDetails}>Role: {task.role}</p>
          </div>

          <div className={styles.statusActions}>
            <span
              className={`${styles.status} ${
                task.status === "Completed"
                  ? styles.completed
                  : task.status === "Rejected"
                  ? styles.rejected
                  : styles.pending
              }`}
              onClick={() => toggleTaskStatus(task._id, task.status)}
            >
              {task.status === "Completed" ? (
                <FaCheckCircle />
              ) : task.status === "Rejected" ? (
                <FaTimesCircle />
              ) : (
                <FaHourglassHalf />
              )}
              {task.status}
            </span>

            {task.status === "Rejected" ? null : task.status === "Approved" ? null : task.status === "Pending" ? (
              <button
                className={styles.submitButton}
                onClick={() => handleinspect(task)}
              >
                🔎 Inspect
              </button>
            ) : (
              <div className={styles.buttonRow}>
                <button
                  className={styles.submitButton}
                  onClick={() => handleApprovProject(task)}
                >
                  ✅ Approve
                </button>
                <button
                  className={styles.rejectButton}
                  onClick={() => handleRejectProject(task)}
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )}
</div>

  );
};

export default MyTasks;
