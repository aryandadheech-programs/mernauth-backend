const jwt = require('jsonwebtoken');
const User = require('./user'); // 👇 User model ko import kiya taaki role check kar sakein

const protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 👇 ID ke sath database se poora user data nikal rahe hain (except password)
    // Isse req.user ke andar hume user ka 'role' mil jayega
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(404).json({ message: 'No user found with this id' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// 👇 Naya Middleware: Jo check karega ki request bhejne wala Admin hai ya nahi
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Agar admin hai, toh aage jaane do
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only!' });
  }
};

module.exports = { protect, adminOnly }; // dono ko export kiya