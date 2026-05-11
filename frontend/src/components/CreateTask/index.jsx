import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";

const CreateTask = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null); // Track editing task
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    taskFile: null,
    taskCode: "",
    startDate: "",
    dueDate: "",
    priority: "Medium",
    projectId: "", // NEW field,
  });
  const [teams, setTeams] = useState([]);
  const [groupProjects, setGroupProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const userId = loggedInUser.id; // ✅ Get user ID

  // Fetch users and tasks from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/auth/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchAllData = async () => {
      try {
        // Fetch tasks and projects in parallel
        const [tasksRes, projectsRes] = await Promise.all([
          axios.get("http://localhost:8000/auth/tasks"),
          axios.get(`http://localhost:8000/auth/student-project/${userId}`),
        ]);

        const tasks = tasksRes.data;
        const projects = projectsRes.data;
        console.log("projects>>>>>", projects);
        setProjects(projects); // store original projects if needed elsewhere

        // Create projectId → projectTitle map
        const projectMap = {};
        projects.forEach((project) => {
          projectMap[project._id] = project.title;
        });

        // Merge project title into each task
        const mergedTasks = tasks.map((task) => ({
          ...task,
          projectName: projectMap[task.projectId] || "Unknown Project",
        }));

        setTasks(mergedTasks);
        console.log("task>>>>", mergedTasks);
      } catch (error) {
        console.error("Error fetching tasks or projects:", error);
      }
    };

    // Edit Task handler (can move outside useEffect if used in JSX)
    const handleEdit = (task) => {
      setTaskData({ ...task, taskFile: null }); // Avoid file upload issues
      setEditingTaskId(task._id);
    };
    const init = async () => {
      await fetchUsers();
      await fetchAllData();
    };
    init();
  }, []);

  useEffect(() => {
    const fetchGroupProjects = async () => {
      try {
        const teamRes = await axios.get("http://localhost:8000/auth/teams");
        const allTeams = Array.isArray(teamRes.data.teams)
          ? teamRes.data.teams
          : [];

        // console.log("user _id",userId);
        // console.log("allTeams",allTeams);
        // ✅ Safely filter teams where the current user is a member
        const userGroups = allTeams.filter(
          (team) =>
            Array.isArray(team.members) &&
            team.members.some((member) => member._id === userId)
        );

        // console.log("userGroups",userGroups);

        setTeams(userGroups);

        // Step 1: Get all group IDs the user is part of
        const groupIds = userGroups.map((group) => group._id);

        console.log("groupId>>", groupIds);
        // Step 2: Fetch all assigned projects
        const assignRes = await axios.get(
          "http://localhost:8000/auth/assigned-projects"
        );
        const allAssigns = assignRes.data;
        console.log("allAssigns", allAssigns);

        // Step 3: Filter assignments relevant to user’s groups
        const relevantAssignments = allAssigns.filter((assign) =>
          groupIds.includes(assign.groupId._id)
        );
        console.log("relevantAssignments", relevantAssignments);
        // Step 4: Attach project details to assignments
        console.log("projects", projects);

        const enriched = relevantAssignments.map((assign) => {
          const project = projects.find((p) => p._id === assign.projectId._id);
          return {
            ...assign,
            projectTitle: project?.title || "Unknown",
            projectCode: project?.supervisorName || "unknown",
            deadline: project?.deadline || "N/A", // renamed to avoid conflict
            status: assign.status || "N/A", // added from relevantAssignments
          };
        });

        // Now you can use enriched for display or set it to state
        console.log("enrichedAssignments", enriched);

        setGroupProjects(enriched);
      } catch (error) {
        console.error("Error loading group-based assigned projects", error);
      }
    };

    if (projects.length > 0) {
      fetchGroupProjects(); // now projects will not be empty
    }
  }, [projects]);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    // Check if it's a file input
    if (type === "file") {
      setTaskData({ ...taskData, [name]: files[0] });
    } else {
      setTaskData({ ...taskData, [name]: value });
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", taskData.title);
    formData.append("description", taskData.description);
    if (taskData.taskFile) {
      formData.append("taskFile", taskData.taskFile);
    }
    formData.append("taskCode", taskData.taskCode);
    formData.append("startDate", taskData.startDate);
    formData.append("dueDate", taskData.dueDate);
    formData.append("priority", taskData.priority);
    formData.append("projectId", taskData.projectId);

    try {
      const response = await axios.post(
        "http://localhost:8000/auth/task",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const newTask = response.data.task || response.data;

      // ✅ Ensure correct data structure before updating the state
      const formattedTask = {
        ...newTask,
        startDate: newTask.startDate ? newTask.startDate.split("T")[0] : "N/A",
        dueDate: newTask.dueDate ? newTask.dueDate.split("T")[0] : "N/A",
      };

      setMessage("✅ Task Created Successfully!");

      // ✅ Update the tasks state immediately
      setTasks((prevTasks) => [...prevTasks, formattedTask]);

      // Reset form
      setTaskData({
        title: "",
        description: "",
        taskFile: null,
        taskCode: "",
        startDate: "",
        dueDate: "",
        priority: "Medium",
        projectId: "", // NEW field
      });
    } catch (error) {
      setMessage("❌ Error creating task. Please try again.");
      console.error("Task creation error:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Edit Task
  const handleEdit = (task) => {
    setTaskData(task);
    setEditingTaskId(task._id);
  };

  // Update Task
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:8000/auth/task/${editingTaskId}`,
        taskData
      );
      setMessage("✅ Task Updated Successfully!");
      setTasks(
        tasks.map((task) =>
          task._id === editingTaskId ? response.data.task : task
        )
      );
      setEditingTaskId(null); // Reset edit mode
      setTaskData({
        title: "",
        description: "",
        taskCode: "",
        startDate: "",
        dueDate: "",
        priority: "Medium",
      });
    } catch (error) {
      console.error("Update Error:", error);
      setMessage("❌ Error updating task.");
    }
  };
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTaskId(null); // Optional: reset edit mode on close
  };

  // Delete Task
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(`http://localhost:8000/auth/task/${id}`);
      setMessage("🗑 Task Deleted Successfully!");
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Delete Error:", error);
      setMessage("❌ Error deleting task.");
    }
  };

  const handleAssign = (task) => {
    navigate("/assign-task", { state: { task } });
  };

  const handleSubmitProject = async (projectId, groupId) => {
    try {
      console.log("groupProjects", groupProjects);
      console.log("projectId>>>", projectId);
      console.log("groupId>>>", groupId);

      const response = await axios.post(
        "http://localhost:8000/auth/sub-project",
        { projectId, groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Project submitted successfully!");
      console.log(response.data);
      // Update the project status in groupProjects or relevantAssignments
      setGroupProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.projectId === projectId
            ? { ...project, status: "pending" }
            : project
        )
      );
    } catch (err) {
      console.error("Submit failed", err);
      alert("Submit failed – check console.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>📌 Project Manager</h1>

      {message && (
        <p
          className={`${styles.message} ${
            message.includes("Error") ? styles.error : styles.success
          }`}
        >
          {message}
        </p>
      )}

      {/* Add Task Button */}
      <button onClick={handleOpenModal} className={styles.addTaskBtn}>
        ➕ Add Task
      </button>

      {/* Task Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <span className={styles.closeButton} onClick={handleCloseModal}>
              ❌
            </span>
            <h2 className={styles.card_heading}>
              {editingTaskId ? "🔄 Update Task" : "🆕 Create New Task"}
            </h2>
            <form
              className={styles.task_form}
              onSubmit={editingTaskId ? handleUpdate : handleSubmit}
            >
              <label htmlFor="projectId">Project:</label>
              <select
                name="projectId"
                value={taskData.projectId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select a Project --</option>
                {groupProjects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.projectTitle}
                  </option>
                ))}
              </select>

              <label htmlFor="title">Title:</label>
              <input
                type="text"
                name="title"
                placeholder="Task Title"
                value={taskData.title}
                onChange={handleChange}
                required
              />

              <label htmlFor="description">Description:</label>
              <textarea
                name="description"
                placeholder="Task Description"
                value={taskData.description}
                onChange={handleChange}
                required
              ></textarea>

              <label htmlFor="taskFile">Task File:</label>
              <input
                type="file"
                name="taskFile"
                onChange={handleChange}
                required
              />

              <label htmlFor="taskCode">Task Code:</label>
              <input
                type="text"
                name="taskCode"
                placeholder="Task Code"
                value={taskData.taskCode}
                onChange={handleChange}
                required
              />

              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={taskData.startDate}
                onChange={handleChange}
                required
              />

              <label htmlFor="dueDate">Due Date:</label>
              <input
                type="date"
                name="dueDate"
                value={taskData.dueDate}
                onChange={handleChange}
                required
              />

              <label htmlFor="priority">Priority:</label>
              <select
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
              >
                <option value="Low">🟢 Low Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="High">🔴 High Priority</option>
              </select>

              <button
                type="submit"
                className={styles.button}
                disabled={loading}
              >
                {loading
                  ? "⏳ Processing..."
                  : editingTaskId
                  ? "🔄 Update Task"
                  : "✅ Create Task"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Project List Table */}
      {/* Group Assigned Projects Table */}
      <div className={styles.card}>
        <h2 className={styles.table_heading}>
          👥 Group-Based Assigned Projects
        </h2>
        <table className={styles.task_table}>
          <thead>
            <tr>
              <th>Project Title</th>
              <th>Supervisor Name</th>
              <th>Subject Name</th>
              <th>Deadline</th>
              <th>Action</th> {/* 👈 Changed from "Group Role" */}
            </tr>
          </thead>
          <tbody>
            {groupProjects.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "#888" }}>
                  You are not assigned to any group project.
                </td>
              </tr>
            ) : (
              groupProjects.map((project) => (
                <tr key={project._id}>
                  <td style={{width:"1000px"}}>{project.projectTitle}</td>
                  <td style={{width:"800px"}}>{project.projectCode}</td>
                  <td style={{width:"800px"}}>{project.groupId.subject}</td>
                  <td style={{width:"800px"}}>{project.deadline}</td>
                  <td style={{width:"500px"}}>
                  {project.status === "approved" ? (
  <button className={styles.approvedButton} disabled>
    Project Approved
  </button>
) : project.status === "pending" ? (
  <button className={styles.waitingButton} disabled>
    Waiting for Approval
  </button>
) : project.status === "rejected" ? (
  <>
  <button className={styles.rejectedButton} disabled>
    Project Rejected
  </button>
   <button
    onClick={() =>
      handleSubmitProject(project.projectId, project.groupId._id)
    }
    className={styles.againsubmitButton}
  >
    Submit Project
  </button>
  
  </>
) : (
  <button
    onClick={() =>
      handleSubmitProject(project.projectId, project.groupId._id)
    }
    className={styles.projectsubmitButton}
  >
    Submit Project
  </button>
)}

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h1 className={styles.heading}>📌 Task Manager</h1>

      {/* Task List Table */}
      <div className={styles.card}>
        <h2 className={styles.table_heading}>📋 Task List</h2>
        <table className={styles.task_table}>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Task Title</th>
              {/* <th>Description</th> */}
              {/* <th>Task File</th> */}
              <th>Task Code</th>
              <th>Start Date</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id}>
                <td>{task?.projectName || "N/A"}</td>

                <td>{task.title}</td>
                {/* <td>{task.description}</td> */}
                {/* <td>{task.taskFile ? "📂 File Uploaded" : "No File"}</td> */}
                <td>{task.taskCode}</td>
                <td>{task.startDate ? task.startDate.split("T")[0] : "N/A"}</td>
                <td>{task.dueDate ? task.dueDate.split("T")[0] : "N/A"}</td>
                <td>
                  <span
                    className={`${styles.priority} ${styles[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td>
                  <div className={styles.buttonRow}>
                    <button
                      className={styles.editButton}
                      onClick={() => {
                        handleEdit(task);
                        setShowModal(true);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(task._id)}
                    >
                      🗑 Delete
                    </button>
                    <button
                      className={styles.assignButton}
                      onClick={() => handleAssign(task)}
                    >
                      📌 Assign
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateTask;
