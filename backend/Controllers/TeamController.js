// controllers/teamController.js
const Team = require("../Models/Team"); // Team model
const Users = require("../Models/Users"); // Assuming you have a User model for student data
const Project = require("../Models/SupervisorModels/Project"); // Assuming you have a Project model

// Create a new team
exports.createTeam = async (req, res) => {
  try {
    console.log(req.body);

    const {
      subject,
      memberIds,
      memberNames,
      createdBy,
      creatorName,
      supervisorId,
      supervisorName,
    } = req.body;

    if (!subject || !memberIds || memberIds.length === 0 || !supervisorId || !supervisorName) {
      return res.status(400).json({ message: "Subject, supervisor and at least one team member are required" });
    }

    const users = await Users.find({ '_id': { $in: memberIds } });
    if (users.length !== memberIds.length) {
      return res.status(400).json({ message: "Some users are not valid students" });
    }

    const newTeam = new Team({
      subject,
      members: memberIds,
      memberNames,
      createdBy,
      creatorName,
      supervisorId,
      supervisorName,
    });

    await newTeam.save();

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: newTeam,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

  
// Fetch all teams
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate("members", "name email");

    if (!teams || teams.length === 0) {
      return res.status(404).json({ message: "No teams found" });
    }

    res.status(200).json({ teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
