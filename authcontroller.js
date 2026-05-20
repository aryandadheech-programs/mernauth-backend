const User = require('./user');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Helper to generate JWT Token
const generateToken = (res, userId) => {
  const secretKey = process.env.JWT_SECRET || 'my_super_secret_key_123';
  
  const token = jwt.sign({ id: userId }, secretKey, { expiresIn: '1d' });
  
  res.cookie('token', token, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict', 
    maxAge: 24 * 60 * 60 * 1000 
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password });
    generateToken(res, user._id);

    return res.status(201).json({
      success: true,
      // 👇 Yahan 'role' add kiya hai taaki frontend ko register hote hi pata chal sake
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
    
  } catch (error) {
    console.log("============== ASLI ERROR YAHAN HAI ==============");
    console.error(error);
    console.log("==================================================");

    return res.status(500).json({ message: 'Server Error during signup' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    generateToken(res, user._id);
    return res.status(200).json({
      success: true,
      // 👇 Yahan bhi 'role' add kiya hai taaki login ke waqt role mil jaye
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error during login' });
  }
};

// @desc    Logout user / Clear Cookie
// @route   POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  return res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile (Check Auth Status)
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    // req.user hume authmiddleware se mil raha hai
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
};

// =========================================================================
// 👇 USER MANAGEMENT CONTROLLERS (Naye functions jo dashboard ke liye hain)
// =========================================================================

// @desc    Get all users list
// @route   GET /api/auth/users
exports.getAllUsers = async (req, res) => {
  try {
    // Saare users nikal rahe hain par unka password nahi bhejenge security ke liye
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users from database' });
  }
};

// @desc    Delete a user by ID
// @route   DELETE /api/auth/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Admin khud ko hi delete na karle, uska ek check laga dete hain
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account!" });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user' });
  }
};