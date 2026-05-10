const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Supervisor = require("../models/supervisorModel");

// 👉 Signup Controller
const supervisorSignup = async (req, res) => {
  try {
    const { name, email, password, phone, department } = req.body;

    // Check if supervisor already exists
    const existing = await Supervisor.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Supervisor already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new supervisor
    const newSupervisor = new Supervisor({
      name,
      email,
      password: hashedPassword,
      phone,
      department
    });

    await newSupervisor.save();

    // Create JWT token
    const token = jwt.sign({ id: newSupervisor._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Send back response
    res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        _id: newSupervisor._id,
        name: newSupervisor.name,
        email: newSupervisor.email,
        phone: newSupervisor.phone,
        department: newSupervisor.department,
        designation: newSupervisor.designation,
        status: newSupervisor.status,
        createdAt: newSupervisor.createdAt
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 👉 Login Controller
const supervisorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const supervisor = await Supervisor.findOne({ email });

    if (!supervisor) {
      return res.status(404).json({ success: false, message: "Supervisor not found" });
    }

    const isMatch = await bcrypt.compare(password, supervisor.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
      const jwtToken = jwt.sign(
                {email: supervisor.email,_id: supervisor._id},
                process.env.JWT_SECRET,
                {expiresIn: "24h"}
    
             )

    // ✅ Send supervisor data in response (only required fields)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token:jwtToken,
      user: {
        _id: supervisor._id,
        name: supervisor.name,
        email: supervisor.email,
        phone: supervisor.phone,
        department: supervisor.department,
        designation: supervisor.designation,
        status: supervisor.status,
        createdAt: supervisor.createdAt,
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


module.exports = {
  supervisorSignup,
  supervisorLogin
};
