const express = require('express');
const passport = require('passport');
const User = require('../models/user'); // Ensure the User model exists
const router = express.Router();

// Render the registration page
router.get('/register', (req, res) => {
    res.render('auth/register'); // Ensure you have a `views/auth/register.ejs` file
});

// Handle user registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if the username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            req.flash('error_msg', 'Username is already taken.');
            return res.redirect('/auth/register');
        }

        // Create a new user
        const newUser = new User({ username, password });
        await newUser.save();
        req.flash('success_msg', 'You are now registered and can log in.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred. Please try again.');
        res.redirect('/auth/register');
    }
});

// Render the login page
router.get('/login', (req, res) => {
    res.render('auth/login'); // Ensure you have a `views/auth/login.ejs` file
});

// Handle user login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dietPlans', // Redirect to diet plans after login
        failureRedirect: '/auth/login', // Stay on the login page if login fails
        failureFlash: true, // Enable flash messages for errors
    })(req, res, next);
});

// Handle user logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        req.flash('success_msg', 'You have logged out.');
        res.redirect('/auth/login');
    });
});

module.exports = router;
