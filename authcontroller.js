const User = require('./user');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// GENERATE TOKEN
const generateToken = (userId) => {

  const secretKey =
    process.env.JWT_SECRET || 'supersecretkeyjeet123';

  return jwt.sign(
    { id: userId },
    secretKey,
    { expiresIn: '1d' }
  );
};

// SIGNUP
const signup = async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const { name, email, password } = req.body;

  try {

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    const token =
      generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: 'Signup failed'
    });
  }
};

// LOGIN
const login = async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  try {

    const user =
      await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const isMatch =
      await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token =
      generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: 'Login failed'
    });
  }
};

// LOGOUT
const logout = async (req, res) => {

  return res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

// GET ME
const getMe = async (req, res) => {

  return res.status(200).json({
    success: true,
    user: req.user
  });
};

// GET USERS
const getAllUsers = async (req, res) => {

  try {

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Failed to fetch users'
    });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {

  try {

    const userId = req.params.id;

    if (userId === req.user.id.toString()) {
      return res.status(400).json({
        message: 'Cannot delete yourself'
      });
    }

    const user =
      await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted'
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Delete failed'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
  getAllUsers,
  deleteUser
};