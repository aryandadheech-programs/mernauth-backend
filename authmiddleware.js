const jwt = require('jsonwebtoken');
const User = require('./user');

const protect = async (req, res, next) => {

  console.log("HEADERS:", req.headers);

  const authHeader = req.headers.authorization;

  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

  console.log("TOKEN RECEIVED:", token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token missing'
    });
  }

  try {

    const secretKey =
      process.env.JWT_SECRET || 'supersecretkeyjeet123';

    const decoded = jwt.verify(token, secretKey);

    console.log("DECODED TOKEN:", decoded);

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    next();

  } catch (error) {

    console.log("JWT ERROR:", error);

    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

const adminOnly = (req, res, next) => {

  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Admins only access'
    });
  }
};

module.exports = { protect, adminOnly };