// controllers/messageController.js
const mongoose = require('mongoose');
const Message = require('../Models/Message'); // Import the Message model
const session = require('express-session');
const Users = require("../Models/Users");
const Supervisors = require('../Models/supervisorModel');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, message } = req.body;
    // console.log("🔐 JWT Sender ID:", senderId);
    // console.log("📩 Receiver ID:", receiverId);
    // console.log("💬 Message:", message);

    if (!message || !receiverId) {
      return res.status(400).json({ success: false, message: 'Message and receiverId are required' });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      timestamp: new Date(),
    });

    await newMessage.save();

    res.status(201).json({ success: true, message: 'Message sent' });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};




exports.getMessages = async (req, res) => {
  try {
    // console.log("req for messages from the Controller>>",req);
  
    const senderId = req.user._id; // ✅ from JWT
    const { receiverId } = req.params;
    

    // console.log("🔐 JWT Sender ID:", senderId);
    // console.log("📩 Receiver ID:", receiverId);

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ success: false, message: 'Invalid sender or receiver ID' });
    }

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to get messages' });
  }
};



exports.getAllMessages= async (req, res) => {
  const { userId } = req.params;

  try {
    const senders = await Message.distinct('senderId', {
      receiverId: userId
    });

    // Fetch user details for those senders
    const user = await Users.find({ _id: { $in: senders } });
    const supervisors = await Supervisors.find({ _id: { $in: senders } });
     // Merge both results
     const users = [...user, ...supervisors];

    res.status(200).json({ senders });
  } catch (error) {
    console.error("❌ Error fetching chat senders:", error);
    res.status(500).json({ message: "Server error" });
  }
};




