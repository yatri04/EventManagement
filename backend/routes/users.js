const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Get all users (for discovery)
// @route   GET /api/users
// @access  Public
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skillFilter = req.query.skill;
        const sortBy = req.query.sort || 'recent';

        let query = { isBanned: false };

        // Filter by skill
        if (skillFilter) {
            query.$or = [
                { 'skillsOffering.name': { $regex: skillFilter, $options: 'i' } },
                { 'skillsSeeking.name': { $regex: skillFilter, $options: 'i' } }
            ];
        }

        // Sort options
        let sortOptions = {};
        switch (sortBy) {
            case 'rating':
                sortOptions = { rating: -1 };
                break;
            case 'skills':
                sortOptions = { $expr: { $add: [{ $size: '$skillsOffering' }, { $size: '$skillsSeeking' }] } };
                break;
            default:
                sortOptions = { createdAt: -1 };
        }

        const users = await User.find(query)
            .select('-password')
            .sort(sortOptions)
            .limit(limit)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isBanned) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Update user skills
// @route   PUT /api/users/skills
// @access  Private
router.put('/skills', protect, async (req, res) => {
    try {
        const { skillsOffering, skillsSeeking } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (skillsOffering) {
            user.skillsOffering = skillsOffering;
        }

        if (skillsSeeking) {
            user.skillsSeeking = skillsSeeking;
        }

        const updatedUser = await user.save();

        res.json({
            skillsOffering: updatedUser.skillsOffering,
            skillsSeeking: updatedUser.skillsSeeking
        });
    } catch (error) {
        console.error('Update skills error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Search users by skill
// @route   GET /api/users/search/:skill
// @access  Public
router.get('/search/:skill', async (req, res) => {
    try {
        const skill = req.params.skill;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const query = {
            isBanned: false,
            $or: [
                { 'skillsOffering.name': { $regex: skill, $options: 'i' } },
                { 'skillsSeeking.name': { $regex: skill, $options: 'i' } }
            ]
        };

        const users = await User.find(query)
            .select('-password')
            .sort({ rating: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            searchTerm: skill,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Get recommended users
// @route   GET /api/users/recommendations
// @access  Private
router.get('/recommendations', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find users who have skills the current user is seeking
        const seekingSkills = Array.isArray(user.skillsSeeking) ? user.skillsSeeking.map(skill => skill.name) : [];
        const offeringSkills = Array.isArray(user.skillsOffering) ? user.skillsOffering.map(skill => skill.name) : [];

        const recommendations = await User.find({
            _id: { $ne: req.user._id },
            isBanned: false,
            $or: [
                { 'skillsOffering.name': { $in: seekingSkills } },
                { 'skillsSeeking.name': { $in: offeringSkills } }
            ]
        })
        .select('-password')
        .sort({ rating: -1 })
        .limit(6);

        res.json(recommendations);
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Update user availability
// @route   PUT /api/users/availability
// @access  Private
router.put('/availability', protect, async (req, res) => {
    try {
        const { availability } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.availability = availability;
        const updatedUser = await user.save();

        res.json({ availability: updatedUser.availability });
    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 