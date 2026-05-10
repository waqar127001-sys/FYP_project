const TaskAssignment = require("../Models/TaskAssignment");
const mongoose = require("mongoose"); // ✅ Ensure this is present
const Task = require("../Models/Task");
const UserProjectSummary = require("../Models/UserProjectSummary");
const Teams = require("../Models/Team");
const AssignProject = require("../Models/SupervisorModels/AssignedProject");
const Project = require("../Models/SupervisorModels/Project");

// ✅ Assign a Task
exports.assignTask = async (req, res) => {
  try {
    const { project, user, user_id, role, assignedBy } = req.body;

    if (!project || !user || !user_id || !role || !assignedBy) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // ✅ Create and save new Task
    const newTaskAssignment = new TaskAssignment({
      project,
      user,
      user_id,
      role,
      assignedBy,
    });

    await newTaskAssignment.save();

    // ✅ Check if user summary already exists
    let userSummary = await UserProjectSummary.findOne({ userId: user_id });

    if (userSummary) {
      // Increment pendingProjects count
      userSummary.pendingProjects += 1;
      await userSummary.save();
    } else {
      // Create new summary
      await UserProjectSummary.create({
        userId: user_id,
        userName: user,
        completedProjects: 0,
        pendingProjects: 1,
      });
    }

    res.status(201).json({
      message: "Task assigned successfully and summary updated",
      task: newTaskAssignment,
    });
  } catch (error) {
    console.error("❌ Error assigning task:", error);
    res
      .status(500)
      .json({ message: "Error assigning task", error: error.message });
  }
};

exports.getProjectsByStudent = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Step 1: Find all group IDs where this user is a member
    const groups = await Teams.find({ members: userId }, "_id");
    if (!groups.length) {
      return res
        .status(404)
        .json({ message: "No groups found for this student" });
    }
    const groupIds = groups.map((group) => group._id);
   
    // Step 2: Find assigned projects for these group IDs
    // Step 2: Find assigned projects using groupIds
    const assignedProjects = await AssignProject.find(
      { groupId: { $in: groupIds } },
      "projectId"
    );
    if (!assignedProjects.length) {
      return res
        .status(404)
        .json({
          message: "No assigned projects found for the student's groups"
        });
    }
    const projectIds = assignedProjects.map((ap) => ap.projectId);
    console.log("projectIds>>>", projectIds);
    // Step 3: Fetch project details
    const projects = await Project.find({ _id: { $in: projectIds } });

    res.status(200).json(projects);
  } catch (err) {
    console.error("Error in getProjectsByStudent:", err);
    res
      .status(500)
      .json({ message: "Server error while fetching student projects" });
  }
};

exports.getMyAssignments = async (req, res) => {
  try {
    const { userId } = req.query; // ✅ Query parameter se `userId` le rahe hain

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // ✅ Find only assignments where `user_id` matches
    const assignments = await TaskAssignment.find({ user_id: userId }).populate(
      "user assignedBy"
    );

    // ✅ Fetch project details
    const allProjects = await Task.find();

    const updatedAssignments = assignments.map((task) => {
      const projectDetails = allProjects.find(
        (proj) => proj._id.toString() === task.project.toString()
      );

      return {
        ...task._doc,
        project: projectDetails ? projectDetails.title : "Unknown Project",
      };
    });

    res.status(200).json(updatedAssignments);
  } catch (error) {
    console.error("❌ Error fetching my assignments:", error);
    res.status(500).json({ message: "Error fetching my assignments", error });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { project, user, user_id, role, assignedBy } = req.body;

    if (!project || !user || !user_id || !role || !assignedBy) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const updatedTask = await TaskAssignment.findByIdAndUpdate(
      id,
      { project, user, user_id, role, assignedBy },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task assignment not found!" });
    }

    res
      .status(200)
      .json({
        message: "Task assignment updated successfully",
        task: updatedTask,
      });
  } catch (error) {
    console.error("❌ Error updating task assignment:", error);
    res
      .status(500)
      .json({
        message: "Error updating task assignment",
        error: error.message,
      });
  }
};

exports.getOtherAssignments = async (req, res) => {
  try {
    const { userId } = req.query; // ✅ Query parameter se `userId` le rahe hain

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // ✅ Find only assignments where `user_id` matches
    const assignments = await TaskAssignment.find({}).populate(
      "user assignedBy"
    );

    // ✅ Fetch project details
    const allProjects = await Task.find();

    const updatedAssignments = assignments.map((task) => {
      const projectDetails = allProjects.find(
        (proj) => proj._id.toString() === task.project.toString()
      );

      return {
        ...task._doc,
        project: projectDetails ? projectDetails.title : "Unknown Project",
      };
    });

    res.status(200).json(updatedAssignments);
  } catch (error) {
    console.error("❌ Error fetching my assignments:", error);
    res.status(500).json({ message: "Error fetching my assignments", error });
  }
};

// ✅ Get all task assignments
exports.getAssignments = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // ✅ Fetch assigned tasks by user
    const assignments = await TaskAssignment.find({
      assignedBy: userId,
    }).populate("user assignedBy");

    // ✅ Fetch all projects (since we need project details)
    const allProjects = await Task.find(); // Fetch all projects from Task table
    //  console.log("allProjects",allProjects);
    //  console.log("assignments",assignments);
    const updatedAssignments = assignments.map((task) => {
      const projectDetails = allProjects.find(
        (proj) => proj._id.toString() === task.project.toString()
      );

      return {
        ...task._doc, // Spread task details
        project: projectDetails ? projectDetails.title : "Unknown Project", // Corrected key
      };
    });

    res.status(200).json(updatedAssignments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assignments", error });
  }
};

// ✅ Get assignments by project
exports.getAssignmentsByProject = async (req, res) => {
  try {
    console.log("res>>>>>>", req.params);
    const { projectId } = req.params;
    const assignments = await TaskAssignment.find({
      project: projectId,
    }).populate("user assignedBy");
    res.status(200).json(assignments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching project assignments", error });
  }
};

// ✅ Delete an assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await TaskAssignment.findByIdAndDelete(id);
    res.status(200).json({ message: "Task assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting assignment", error });
  }
};
