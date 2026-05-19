// Purana code: require('../controllers/authController') ya aisa kuch tha
// Use badal kar yeh kijiye:
const { signup, login, logout, getMe } = require('./authcontroller');
const { protect } = require('./authmiddleware');
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

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

module.exports = router;