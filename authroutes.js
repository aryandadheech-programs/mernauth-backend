// Controllers se humne do naye functions (getAllUsers aur deleteUser) nikal liye hain
const { signup, login, logout, getMe, getAllUsers, deleteUser } = require('./authcontroller');
// Middleware se 'protect' ke sath naya 'adminOnly' middleware bhi nikala
const { protect, adminOnly } = require('./authmiddleware');
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Existing Auth Routes
router.post('/signup', [
  check('name', 'Name is required').notEmpty().trim(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], signup);

router.post('/login', [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists()
], login);

router.post('/logout', logout);
router.get('/me', protect, getMe);

// 👇 USER MANAGEMENT ROUTES (Naye routes jo dashboard me kaam aayenge)
// Pehle token 'protect' hoga, fir check hoga ki banda 'adminOnly' hai ya nahi

router.get('/users', protect, adminOnly, getAllUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;