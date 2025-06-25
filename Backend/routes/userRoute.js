const express = require('express');
const router = express.Router();
const userAuthController = require('../controllers/UserAuthController');

// User registration route
router.post('/register', userAuthController.registerUser);

// User login route
router.post('/login', userAuthController.loginUser);

// Forgot password route
router.post('/forgot-password', userAuthController.forgotPassword);

// Reset password route
router.post('/reset-password/:token', userAuthController.resetPassword);

// Get all users route
router.get('/users', userAuthController.getAllUsers);

// Get a single user by ID route
router.get('/users/:id', userAuthController.getUserById);

// Update a user by ID route
router.put('/users/:id', userAuthController.updateUser);

// Delete a user by ID route
router.delete('/users/:id', userAuthController.deleteUser);

// New route for fetching user profile
router.get('/profile', userAuthController.getUserProfile);

// New route for updating user profile
router.put('/profile', userAuthController.updateProfile);

module.exports = router;