const route = require("express").Router();
const multer = require("multer");
const path = require("path");
const { signup, login } = require("../Controllers/AuthController");
const {
  signupValidation,
  loginValidation,
} = require("../Middlewares/AuthValidation"); // Middleware for validation
const { UserList } = require("../Controllers/UserController");
const {
  createTask,
  TaskList,
  updateTask,
  deleteTask,
  submitProject,
  approveTask,
  subProject,
  rejectTask,
} = require("../Controllers/TaskController");
const {
  assignTask,
  getAssignments,
  getMyAssignments,
  getOtherAssignments,
  deleteAssignment,
  updateAssignment,
  getProjectsByStudent,
} = require("../Controllers/AssignTaskController");
const {
  getTaskSummary,
  getTaskProgress,
  getLeaderboard,
  getRecentTasks,
} = require("../Controllers/DashboardController");
const {
  createTemplate,
  updateTemplate,
  getAllTemplates,
  getTemplateById,
  deleteTemplate,
} = require("../Controllers/TemplateController.js");
const {
  sendMessage,
  getMessages,
  getAllMessages,
} = require("../Controllers/MessageController.js");
const authenticate = require("../Middlewares/authenticate.js"); // JWT middleware
const {
  submitFeedback,
  getFeedbacks,
} = require("../Controllers/FeedbackController");
const { supervisorSignup, supervisorLogin } = require("../Controllers/SupervisorAuthController");
const { createProject, getAllProjects,assignProject,getSupervisorProjectStats ,AssignedProjectList,getAllSupervisors  ,submitFinalProject } = require("../Controllers/SupervisorProjectController");
const { createTeam, getAllTeams } = require("../Controllers/TeamController");


const { admin_signup, admin_login,getAllAdmins,updateProjectStatus  } = require('../Controllers/adminController.js');

// setup multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/templates/"); // or any path you want
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ✅ Final Route with middleware:
route.post("/templates/upload", upload.single("template"), createTemplate);

route.put('/update-project-status/:projectId', updateProjectStatus);

route.get("/templates",getAllTemplates);

route.patch("/templates/update/:id",updateTemplate);
route.delete("/templates/del/:id",deleteTemplate);




// Route to submit a project (change status to "approval")
route.put('/submit/:id', submitFinalProject);



// Route to get assigned project stats for a supervisor
route.get('/assigned-projects', AssignedProjectList); // Get all assigned projects

route.get('/assigned-projects/stats/:supervisorId', getSupervisorProjectStats);
// Create a Project
route.post("/create-project", createProject);

route.post('/create-team', createTeam); // Create a team\

// Get all Projects
route.get("/projects", getAllProjects);

route.post('/admin_signup', admin_signup);
route.post('/admin_login', admin_login);
// GET /api/admins
route.get("/admins", getAllAdmins);


// Assign Project
route.post("/assign-project", assignProject);  // ✅ Corrected POST
route.post("/sub-project", subProject);


  route.get("/teams", getAllTeams);

  route.get('/student-project/:userId', getProjectsByStudent); // ✅ Corrected route to get projects by student ID


// Route to get all supervisors
route.get("/supervisors", getAllSupervisors);



// 👉 Supervisor Signup Route
route.post("/supervisor/signup", supervisorSignup);


route.get("/chat-senders/:userId",getAllMessages);

// 👉 Supervisor Login Route
route.post("/supervisor/login", supervisorLogin);

route.post("/Feedback/submit", submitFeedback);
route.get("/Feedback/list", getFeedbacks);

route.post("/submit-project", submitProject);
route.post("/approve-task/:id", approveTask);
route.post("/reject-task/:id", rejectTask);

// ✅ Correct routes
route.post("/messages/send", authenticate, sendMessage);
route.get("/messages/:receiverId", authenticate, getMessages);

route.post("/task", createTask);
route.put("/task/:id", updateTask);
route.delete("/task/:id", deleteTask);
route.post("/signup", signupValidation, signup);
route.post("/login", loginValidation, login);
route.get("/users", UserList);
route.get("/assigned-tasks", getAssignments);
route.get("/Myassigned-tasks", getMyAssignments);
route.get("/Otherassigned-tasks", getOtherAssignments);
route.post("/assigntask", assignTask);
route.get("/tasks", TaskList);
// ✅ Add missing routes for assignments
route.put("/assigntask/:id", updateAssignment); // ✅ Update an assigned task
route.delete("/assigntask/:id", deleteAssignment); // ✅ Delete an assigned task

route.get("/dashboard/tasks", TaskList);

// ✅ Route to fetch task summary (Total, Completed, Pending)
route.get("/dashboard/task-summary", getTaskSummary);

// ✅ Route to fetch task progress over time
route.get("/dashboard/task-progress", getTaskProgress);

// ✅ Route to fetch leaderboard
route.get("/dashboard/leaderboard", getLeaderboard);

// ✅ Route to fetch recent tasks
route.get("/dashboard/recent-tasks", getRecentTasks);



module.exports = route;
