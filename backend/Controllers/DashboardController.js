    const Task = require("../Models/Task.js");
    const User = require("../Models/Users.js");
    const TaskAssignment = require("../Models/TaskAssignment.js");
    const UserProjectSummary = require("../Models/UserProjectSummary.js");
    // ✅ Get Task Summary
    const getTaskSummary = async (req, res) => {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is missing in headers" });
        }
        
        try {
            const totalTasks = await TaskAssignment.countDocuments({ user_id: userId });
            // console.log(`totaltasks>>${totalTasks}`)
            const completedTasks = await TaskAssignment.countDocuments({ user_id: userId, status: "completed" });
            const pendingTasks = await TaskAssignment.countDocuments({ user_id: userId, status: "Pending" });

            // console.log(`Total Tasks: ${totalTasks}, Completed Tasks: ${completedTasks}, Pending Tasks: ${pendingTasks}`);

            res.json({ totalTasks, completedTasks, pendingTasks });
        } catch (error) {
            console.error("Error fetching task summary:", error);
            res.status(500).json({ message: "Error fetching task summary", error });
        }
    };



    // ✅ Get Task Progress Over Time
    const getTaskProgress = async (req, res) => {
        try {
            // Fetch tasks grouped by week
            const weeklyProgress = await Task.aggregate([
                {
                    $group: {
                        _id: { $week: "$createdAt" },
                        completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                        pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } }
                    }
                },
                { $sort: { _id: 1 } } // Sort by week
            ]);

            const labels = weeklyProgress.map(data => `Week ${data._id}`);
            const completedData = weeklyProgress.map(data => data.completed);
            const pendingData = weeklyProgress.map(data => data.pending);

            res.json({ labels, completedData, pendingData });
        } catch (error) {
            res.status(500).json({ message: "Error fetching task progress", error });
        }
    };

    // ✅ Get Leaderboard
    const getLeaderboard = async (req, res) => {
        try {
            const leaderboard = await UserProjectSummary.find().sort({ completedProjects: -1 }).limit(5);
            res.json(leaderboard);
        } catch (error) {
            res.status(500).json({ message: "Error fetching leaderboard", error });
        }
    };

    // ✅ Get Recent Tasks
    const getRecentTasks = async (req, res) => {
        try {
            const recentTasks = await Task.find().sort({ createdAt: -1 }).limit(5);
            res.json(recentTasks);
        } catch (error) {
            res.status(500).json({ message: "Error fetching recent tasks", error });
        }
    };

    module.exports = {
        getTaskSummary,
        getTaskProgress,
        getLeaderboard,
        getRecentTasks
    };
