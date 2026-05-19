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
      user: { id: user._id, name: user.name, email: user.email }
    });
    
  } catch (error) {
    // YEH LINES TERMINAL PAR ASLI ERROR DIKHAYENGI (AGAR AB BHI KOI DIKKAT HOGI TOH)
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
      user: { id: user._id, name: user.name, email: user.email }
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
    const user = await User.findById(req.user.id).select('-password');
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
};