const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Get all available skills
// @route   GET /api/skills
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Get all unique skills from users
        const skillsOffering = await User.aggregate([
            { $unwind: '$skillsOffering' },
            { $group: { _id: '$skillsOffering.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const skillsSeeking = await User.aggregate([
            { $unwind: '$skillsSeeking' },
            { $group: { _id: '$skillsSeeking.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            offering: skillsOffering,
            seeking: skillsSeeking
        });
    } catch (error) {
        console.error('Get skills error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Get popular skills
// @route   GET /api/skills/popular
// @access  Public
router.get('/popular', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const popularOffering = await User.aggregate([
            { $unwind: '$skillsOffering' },
            { $group: { _id: '$skillsOffering.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        const popularSeeking = await User.aggregate([
            { $unwind: '$skillsSeeking' },
            { $group: { _id: '$skillsSeeking.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        res.json({
            offering: popularOffering,
            seeking: popularSeeking
        });
    } catch (error) {
        console.error('Get popular skills error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Search skills
// @route   GET /api/skills/search/:query
// @access  Public
router.get('/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const limit = parseInt(req.query.limit) || 20;

        const matchingOffering = await User.aggregate([
            { $unwind: '$skillsOffering' },
            { $match: { 'skillsOffering.name': { $regex: query, $options: 'i' } } },
            { $group: { _id: '$skillsOffering.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        const matchingSeeking = await User.aggregate([
            { $unwind: '$skillsSeeking' },
            { $match: { 'skillsSeeking.name': { $regex: query, $options: 'i' } } },
            { $group: { _id: '$skillsSeeking.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        res.json({
            query,
            offering: matchingOffering,
            seeking: matchingSeeking
        });
    } catch (error) {
        console.error('Search skills error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Get skill categories
// @route   GET /api/skills/categories
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        const categories = [
            {
                name: 'Programming & Technology',
                skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'HTML/CSS', 'SQL', 'Git', 'AWS']
            },
            {
                name: 'Design & Creative',
                skills: ['Graphic Design', 'UI/UX Design', 'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'Logo Design', 'Web Design']
            },
            {
                name: 'Business & Marketing',
                skills: ['Digital Marketing', 'SEO', 'Social Media Marketing', 'Content Writing', 'Email Marketing', 'Analytics', 'Sales']
            },
            {
                name: 'Languages',
                skills: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 'Portuguese', 'Italian', 'Russian']
            },
            {
                name: 'Music & Arts',
                skills: ['Guitar', 'Piano', 'Singing', 'Drawing', 'Painting', 'Photography', 'Video Editing', 'Music Production']
            },
            {
                name: 'Fitness & Health',
                skills: ['Yoga', 'Personal Training', 'Nutrition', 'Meditation', 'Running', 'Weight Training', 'Dance']
            },
            {
                name: 'Cooking & Food',
                skills: ['Cooking', 'Baking', 'Meal Planning', 'Food Photography', 'Wine Tasting', 'Cake Decorating']
            },
            {
                name: 'Education & Tutoring',
                skills: ['Math Tutoring', 'Science Tutoring', 'Language Teaching', 'Test Preparation', 'Academic Writing']
            }
        ];

        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 