const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, location, bio } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            location,
            bio
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                location: user.location,
                bio: user.bio,
                profileImage: user.profileImage,
                skillsOffering: user.skillsOffering,
                skillsSeeking: user.skillsSeeking,
                availability: user.availability,
                rating: user.rating,
                totalRatings: user.totalRatings,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.comparePassword(password))) {
            if (user.isBanned) {
                return res.status(403).json({ error: 'Account has been banned' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                location: user.location,
                bio: user.bio,
                profileImage: user.profileImage,
                skillsOffering: user.skillsOffering,
                skillsSeeking: user.skillsSeeking,
                availability: user.availability,
                rating: user.rating,
                totalRatings: user.totalRatings,
                isAdmin: user.isAdmin,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.location = req.body.location || user.location;
            user.bio = req.body.bio || user.bio;
            user.profileImage = req.body.profileImage || user.profileImage;
            user.availability = req.body.availability || user.availability;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                location: updatedUser.location,
                bio: updatedUser.bio,
                profileImage: updatedUser.profileImage,
                skillsOffering: updatedUser.skillsOffering,
                skillsSeeking: updatedUser.skillsSeeking,
                availability: updatedUser.availability,
                rating: updatedUser.rating,
                totalRatings: updatedUser.totalRatings,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 