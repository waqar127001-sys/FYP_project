const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Task = require("../Models/Task");
const TaskAssignment = require("../Models/TaskAssignment");
const UserProjectSummary = require("../Models/UserProjectSummary");
const AssignedProject = require("../Models/SupervisorModels/AssignedProject");

const subProject = async (req, res) => {
  try {
    const { projectId, groupId } = req.body;

    if (!projectId || !groupId) {
      return res.status(400).json({ error: "projectId and groupId are required." });
    }

    const assignedProject = await AssignedProject.findOne({ projectId, groupId });

    if (!assignedProject) {
      return res.status(404).json({ error: "Assigned project not found." });
    }

    assignedProject.status = "pending";
    await assignedProject.save();

    res.status(200).json({
      message: "Project submitted successfully. Awaiting approval.",
      assignedProject,
    });
  } catch (err) {
    console.error("Submit project error →", err);
    res.status(500).json({ error: "Failed to submit project." });
  }
};



const updateTask = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, description, taskCode, startDate, dueDate, priority } = req.body;

		const updatedTask = await Task.findByIdAndUpdate(
			id,
			{ title, description, taskCode, startDate, dueDate, priority },
			{ new: true }
		);

		if (!updatedTask) {
			return res.status(404).json({ success: false, message: "Task not found" });
		}

		// res.json({ success: true, message: "Task updated successfully", task: updatedTask });
		res.status(201).json({ success: true, message: "Task updated successfully", task: updatedTask});
	} catch (error) {
		console.error("Task Update Error:", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};


const deleteTask = async (req, res) => {
	try {
		const { id } = req.params;

		const deletedTask = await Task.findByIdAndDelete(id);

		if (!deletedTask) {
			return res.status(404).json({ success: false, message: "Task not found" });
		}

		res.json({ success: true, message: "Task deleted successfully" });
	} catch (error) {
		console.error("Task Deletion Error:", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};


// All Tasks List 
const TaskList = async (req, res) =>{
	try {
	 const tasks = await Task.find();
			res.status(200).json(tasks);
	}
	catch  (error) {
        res.status(500).json({	
            message: "Internal server error!",
            success: false
        });
    }
};

// Create a New Task and Assign it to a User

// Multer Storage Configuration
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/"); // Folder jahan file save hogi
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
	},
});

// Multer Middleware
const upload = multer({ storage: storage }).single("taskFile");

const createTask = async (req, res) => {
	upload(req, res, async (err) => {
		if (err) {
			return res.status(500).json({ success: false, message: "File upload failed" });
		}

		try {
			const { title, description, taskCode, startDate, dueDate, priority, projectId } = req.body;
			const taskFile = req.file ? req.file.filename : null; // File ka naam store karo

			if (!taskFile) {
				return res.status(400).json({ success: false, message: "Please upload a file" });
			}

			const newTask = new Task({
				title,
				description,
				taskFile,
				taskCode,
				startDate,
				dueDate,
				priority,
				projectId,
			});

			await newTask.save();

			res.status(201).json({ success: true, message: "Task Created Successfully!", task: newTask });
		} catch (error) {
			console.error("Task Creation Error:", error);
			res.status(500).json({ success: false, message: "Internal Server Error" });
		}
	});
};

const submitProject = async (req, res) => {
	// console.log("Submission request body:", req.body);
	// Step 1: Extract data from request body
	const { taskId, userId, note } = req.body;
  
	try {
  
	  // Step 2: Update the task assignment
	  const assignmentUpdateResult = await TaskAssignment.updateOne(
		{ _id: taskId},
		{ $set: { status: "Completed" } }
	  );
  
	 // Step 3: Update the user's summary
const summaryUpdateResult = await UserProjectSummary.updateOne(
	{ userId: userId },
	{
	  $inc: {
		completedProjects: 1,
		pendingProjects: -1, // ⬅️ pendingProjects ko 1 se kam karo
	  },
	}
  );
  
  
	  res.status(200).json({
		success: true,
		message: "Project submitted successfully.",
		assignmentUpdate: assignmentUpdateResult,
		summaryUpdate: summaryUpdateResult,
	  });
	} catch (error) {
	  console.error("Submission error:", error);
	  res.status(500).json({ error: "Submission failed." });
	}
  };
  
  const approveTask = async (req, res) => {
	const taskId = req.params.id;
	const { userId } = req.body;

	try {
	  const assignmentUpdateResult = await TaskAssignment.updateOne(
		{ _id: taskId },
		{ $set: { status: "Approved" } }
	  );
  
	  const summaryUpdateResult = await UserProjectSummary.updateOne(
		{ userId: userId },
		{
		  $inc: {
			completedProjects: 1,
			pendingProjects: -1,
		  },
		}
	  );
  
	  return res.status(200).json({
		success: true,
		message: "Task approved successfully",
		assignmentUpdate: assignmentUpdateResult,
		summaryUpdate: summaryUpdateResult,
	  });
	} catch (error) {
	  console.error("Approve Task Error:", error);
	  return res.status(500).json({ success: false, message: "Server Error" });
	}
  };
 
  
  const rejectTask = async (req, res) => {
	const taskId = req.params.id;
	const { userId } = req.body;
  
	try {
	  const assignmentUpdateResult = await TaskAssignment.updateOne(
		{ _id: taskId },
		{ $set: { status: "Rejected" } }
	  );
  
	  // Optional: Decrease pendingProjects if needed
	  const summaryUpdateResult = await UserProjectSummary.updateOne(
		{ userId: userId },
		{
		  $inc: {
			pendingProjects: -1
		  }
		}
	  );
  
	  return res.status(200).json({
		success: true,
		message: "Task rejected successfully",
		assignmentUpdate: assignmentUpdateResult,
		summaryUpdate: summaryUpdateResult
	  });
	} catch (error) {
	  console.error("Reject Task Error:", error);
	  return res.status(500).json({ success: false, message: "Server Error" });
	}
  };
  
  
  


module.exports = { createTask , TaskList , updateTask, deleteTask , submitProject ,approveTask ,rejectTask,subProject};














