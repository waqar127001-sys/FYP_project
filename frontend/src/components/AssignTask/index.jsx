import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Main from "../Main";

const AssignTask = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(["Developer", "Moderator", "Admin", "Tester", "Designer"]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const location = useLocation();
  const task = location.state?.task;
  const navigate = useNavigate(); // Hook to navigate to chat page

  useEffect(() => {
    fetchProjects();
    fetchUsers();
    fetchAssignedTasks();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:8000/auth/tasks");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
  
      if (!loggedInUser || !loggedInUser.id) {
        alert("User not found. Please log in again!");
        return;
      }
  
      const userId = loggedInUser.id;
  
      const response = await axios.get("http://localhost:8000/auth/users");
      const allUsers = response.data.users || response.data;
  
      // ❌ Remove the logged-in user from list
      const filteredUsers = allUsers.filter(user => user._id !== userId);
  
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };
  

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const handleUpdateTask = async () => {
    if (!editingTask.project || !editingTask.user || !editingTask.role) {
      alert("All fields are required!");
      return;
    }

    try {
      await axios.put(`http://localhost:8000/auth/assigntask/${editingTask._id}`, editingTask);
      alert("Task updated successfully!");
      setEditingTask(null);
      fetchAssignedTasks();
    } catch (error) {
      console.error("❌ Error updating task:", error);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(`http://localhost:8000/auth/assigntask/${taskId}`);
      setAssignedTasks(assignedTasks.filter((task) => task._id !== taskId));
      console.log("✅ Task deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting task:", error);
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      if (!loggedInUser || !loggedInUser.id) {
        alert("User not found. Please log in again!");
        return;
      }

      const userId = loggedInUser.id;
      const response = await axios.get(`http://localhost:8000/auth/assigned-tasks?userId=${userId}`);
      setAssignedTasks(response.data);
    } catch (error) {
      console.error("❌ Error fetching assigned tasks:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedProject || !selectedUser || !selectedRole) {
        alert("Please select all fields before assigning the task!");
        return;
      }

      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      if (!loggedInUser || !loggedInUser.id) {
        alert("User not found. Please log in again!");
        return;
      }

      const assignedBy = loggedInUser.id;
      const [userId, userName] = selectedUser.split(",");
      const requestBody = {
        project: String(selectedProject),
        user: String(userName),
        user_id: String(userId),
        role: selectedRole,
        assignedBy: String(assignedBy),
      };

      console.log("📤 Sending Data:", requestBody);

      const response = await axios.post("http://localhost:8000/auth/assigntask", requestBody);

      console.log("✅ Task Assigned Successfully:", response.data);
      fetchAssignedTasks();
    } catch (error) {
      console.error("❌ Error assigning task:", error.response ? error.response.data : error);
    }
  };

  const handleChat = (task) => {
    const chatId = `${task._id}_${task.user_id}`;
    navigate(`/chat/${chatId}`);
  };

  
  

  return (
    <div className={styles.assignTaskContainer}>
      {/* Create Task Button */}
    

      <h2 className={styles.heading}>Assign Task</h2>
      <div className={styles.formContainer}>
        <select className={styles.select} value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>{project.title}</option>
          ))}
        </select>

        <select className={styles.select} value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user._id} value={[user._id, user.name]}>{user.name}</option>
          ))}
        </select>

        <select className={styles.select} value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value="">Select Role</option>
          {roles.map((role, index) => (
            <option key={index} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <button className={styles.assignButton} onClick={handleSubmit}>Assign</button>

      <h3 className={styles.subHeading}>Assigned Tasks</h3>
      <table className={styles.taskTable}>
        <thead>
          <tr>
            <th>Project</th>
            <th>User</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignedTasks.map((task) => (
            <tr key={task._id}>
              <td>
                {editingTask?._id === task._id ? (
                  <select
                    value={editingTask.project}
                    onChange={(e) => setEditingTask({ ...editingTask, project: e.target.value })}
                  >
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  task.project
                )}
              </td>
              <td>
                {editingTask?._id === task._id ? (
                  <select
                    value={`${editingTask.user_id},${editingTask.user}`}
                    onChange={(e) => {
                      const [userId, userName] = e.target.value.split(",");
                      setEditingTask({ ...editingTask, user_id: userId, user: userName });
                    }}
                  >
                    {users.map((user) => (
                      <option key={user._id} value={`${user._id},${user.name}`}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  task.user
                )}
              </td>
              <td>
                {editingTask?._id === task._id ? (
                  <select
                    value={editingTask.role}
                    onChange={(e) => setEditingTask({ ...editingTask, role: e.target.value })}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                ) : (
                  task.role
                )}
              </td>
              <td>
                {editingTask?._id === task._id ? (
                  <button className={styles.updateButton} onClick={handleUpdateTask}>
                    ✅ Save
                  </button>
                ) : (
                  <>
                    <button className={styles.editButton} onClick={() => handleEdit(task)}>
                      ✏️ Edit
                    </button>
                    <button className={styles.deleteButton} onClick={() => handleDelete(task._id)}>
                      🗑 Delete
                    </button>
                    <button className={styles.chatButton} onClick={() => handleChat(task)}>
                      💬 Chat
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignTask;
