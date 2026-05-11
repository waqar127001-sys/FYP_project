import { Route, Routes, Navigate } from "react-router-dom";
import Main from "./components/Main";
import Signup from "./components/Singup";
import Login from "./components/Login";
import CreateTask from "./components/CreateTask";
import AssignTask from "./components/AssignTask";
import SupervisorSignup from "./components/Supervisor_Auth/SignUp";
import SupervisorLogin from "./components/Supervisor_Auth/Login";
import SupervisorMain from "./components/Supervisor_Auth/Main";
import ManageTeams from "./components/Teams";
import AdminLogin from "./components/Admin/AdminAuth/login/AdminLogin";
import AdminSignup from "./components/Admin/AdminAuth/Signup/AdminSignup";
import AdminMain from "./components/Admin/AdminMain";
import RoleSelector from "./components/RoleSelector";


function App() {
	const user = localStorage.getItem("token");
  const adminUser=localStorage.getItem("adminToken");

	return (

		<Routes>


       <Route
    path="/"
    element={<RoleSelector /> }
  />
  {/* Protected Route */}
  <Route 
      path= "/admin/dashboard"
      element={adminUser ? <AdminMain /> : <Navigate to="/admin/login" replace />}
      />


  <Route
    path="/student/Dashboard"
    element={user ? <Main /> : <Navigate to="/student/login" replace />}
  />
 
<Route
    path="/admin/signup"
    element={<AdminSignup /> }
  />

<Route
    path="/admin/login"
    element={<AdminLogin />}
  />




  <Route
    path="/supervisor/signup"
    element={<SupervisorSignup/>} />
  <Route 
  path="/supervisor/login"
    element={<SupervisorLogin/>} />
  <Route path="/supervisor/dashboard" element={<SupervisorMain defaultModule="Dashboard" />} />

  {/* <Route path="/ManageTeams" element={<ManageTeams defaultModule="Dashboard" />} /> */}


  {/* Public Routes */}
  <Route path="/student/chat/:chatId" element={<Main defaultModule="ChatBox" />}  />
  <Route path="/student/signup" element={<Signup />} />
  <Route path="/student/login" element={<Login />} />
  <Route path="/student/my-tasks" element={<Main defaultModule="MyTasks" />} />
  <Route path="/student/create-tasks" element={<Main defaultModule="CreateTask" />} />
  <Route path="/student/Chats" element={<Main defaultModule="ChatBox" />} />
  <Route path="/student/Template-manager" element={<Main defaultModule="Template-manager" />} />
  <Route path="/student/Feedback"  element={<Main defaultModule="Feedback" />} />
  <Route path="/student/Dashboard"  element={<Main defaultModule="Dashboard" />} />
  <Route path="/student/Assign-task"  element={<Main defaultModule="AssignTask" />} />

  {/* You can also protect /create-task if needed */}
  <Route
    path="/student/create-task"
    element={user ? <CreateTask /> : <Navigate to="/student/login" replace />}
  />
</Routes>


	);
}

export default App;
