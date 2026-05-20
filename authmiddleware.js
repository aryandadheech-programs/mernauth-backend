const jwt = require('jsonwebtoken');
const User = require('./user');

const protect = async (req, res, next) => {
  // 🔍 Debugging: Log the headers to see what's actually arriving
  console.log("Full Request Headers:", req.headers);

  // Extract token from Header ONLY (Cookies ka panga chhod do abhi ke liye)
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer') ? authHeader.split(" ")[1] : null;

  if (!token) {
    console.log("❌ NO TOKEN FOUND IN HEADERS");
    return res.status(401).json({ success: false, message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(404).json({ message: 'No user found with this id' });
    }

    next();
  } catch (error) {
    console.log("❌ JWT VERIFY FAILED:", error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only!' });
  }
};

module.exports = { protect, adminOnly };