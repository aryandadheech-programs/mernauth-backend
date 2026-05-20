const {
  signup,
  login,
  logout,
  getMe,
  getAllUsers,
  deleteUser
} = require('./authcontroller');

const {
  protect,
  adminOnly
} = require('./authmiddleware');

const express = require('express');

const router = express.Router();

const { check } = require('express-validator');

// SIGNUP
router.post(
  '/signup',
  [
    check('name', 'Name is required')
      .notEmpty()
      .trim(),

    check('email', 'Valid email required')
      .isEmail()
      .normalizeEmail(),

    check('password', 'Password minimum 6 characters')
      .isLength({ min: 6 })
  ],
  signup
);

// LOGIN
router.post(
  '/login',
  [
    check('email', 'Valid email required')
      .isEmail()
      .normalizeEmail(),

    check('password', 'Password required')
      .exists()
  ],
  login
);

router.post('/logout', logout);

router.get('/me', protect, getMe);

// ADMIN ROUTES
router.get(
  '/users',
  protect,
  adminOnly,
  getAllUsers
);

router.delete(
  '/users/:id',
  protect,
  adminOnly,
  deleteUser
);

module.exports = router;