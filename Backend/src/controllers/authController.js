const User       = require("../models/User");
const ResetToken = require("../models/ResetToken");
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const crypto     = require("crypto");

// ===============================
// REGISTER
// ===============================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    
    // Simple role assignment - no email domain validation
    const assignedRole = role === 'faculty' ? 'faculty' : 'student';
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role: assignedRole 
    });
    
    res.status(201).json({ 
      message: "Registered successfully", 
      userId: user._id,
      assignedRole: assignedRole
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// LOGIN
// ===============================
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    
    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    
    // Role validation - user must login with their assigned role
    if (role && role !== user.role) {
      return res.status(403).json({ 
        message: `Role mismatch. Your account is registered as ${user.role}. Please login with correct role.`,
        actualRole: user.role,
        requestedRole: role
      });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    res.json({ message: "Login successful", token, role: user.role, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET PROFILE
// ===============================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// CHANGE PASSWORD
// ===============================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// FORGOT PASSWORD
// Generates a 6-digit reset code
// For demo: code returned in response
// In production: would be emailed
// ===============================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether email exists — security best practice
      return res.status(200).json({
        message: "If this email is registered, a reset code has been generated."
      });
    }

    // Generate 6-digit code
    const resetCode = crypto.randomInt(100000, 999999).toString();

    // Store in DB with 15-minute expiry (handled by TTL index)
    await ResetToken.findOneAndDelete({ email }); // Clear existing tokens for this email
    await ResetToken.create({
      email,
      code:    resetCode,
      userId:  user._id
    });

    res.json({
      message:   "Reset code generated successfully.",
      resetCode,
      note: "In production this code would be sent to your email."
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: "Email, reset code and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const record = await ResetToken.findOne({ email });
    if (!record) {
      return res.status(400).json({ message: "No reset code found or it has expired. Please request a new one." });
    }

    if (record.code !== resetCode.trim()) {
      return res.status(400).json({ message: "Invalid reset code." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(record.userId, { password: hashedPassword });
    
    // Delete the token after successful reset
    await ResetToken.deleteOne({ _id: record._id });

    res.json({ message: "Password reset successfully. You can now login." });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
