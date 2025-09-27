const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Swap = require('../models/Swap');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/auth');

// All routes require admin privileges
router.use(protect, admin);

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isBanned: false });
        const bannedUsers = await User.countDocuments({ isBanned: true });
        
        const totalSwaps = await Swap.countDocuments();
        const pendingSwaps = await Swap.countDocuments({ status: 'pending' });
        const completedSwaps = await Swap.countDocuments({ status: 'completed' });
        
        const totalNotifications = await Notification.countDocuments();
        const unreadNotifications = await Notification.countDocuments({ isRead: false });

        // Recent activity
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt');

        const recentSwaps = await Swap.find()
            .populate('requester', 'name')
            .populate('recipient', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            stats: {
                users: { total: totalUsers, active: activeUsers, banned: bannedUsers },
                swaps: { total: totalSwaps, pending: pendingSwaps, completed: completedSwaps },
                notifications: { total: totalNotifications, unread: unreadNotifications }
            },
            recentActivity: {
                users: recentUsers,
                swaps: recentSwaps
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Get all users (admin view)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const status = req.query.status; // 'active', 'banned', 'all'

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (status === 'banned') {
            query.isBanned = true;
        } else if (status === 'active') {
            query.isBanned = false;
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
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

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
router.put('/users/:id/ban', async (req, res) => {
    try {
        const { isBanned, reason } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isBanned = isBanned;
        await user.save();

        // Create notification for user
        if (isBanned) {
            await Notification.create({
                recipient: user._id,
                type: 'account_banned',
                title: 'Account Banned',
                message: `Your account has been banned. Reason: ${reason || 'Violation of platform rules'}`,
                priority: 'urgent'
            });
        }

        res.json({ message: `User ${isBanned ? 'banned' : 'unbanned'} successfully` });
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Get all swaps (admin view)
// @route   GET /api/admin/swaps
// @access  Private/Admin
router.get('/swaps', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;

        let query = {};

        if (status) {
            query.status = status;
        }

        const swaps = await Swap.find(query)
            .populate('requester', 'name email')
            .populate('recipient', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const total = await Swap.countDocuments(query);

        res.json({
            swaps,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalSwaps: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get swaps error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Add admin notes to swap
// @route   PUT /api/admin/swaps/:id/notes
// @access  Private/Admin
router.put('/swaps/:id/notes', async (req, res) => {
    try {
        const { adminNotes } = req.body;
        const swap = await Swap.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ error: 'Swap not found' });
        }

        swap.adminNotes = adminNotes;
        await swap.save();

        res.json({ message: 'Admin notes updated successfully' });
    } catch (error) {
        console.error('Update swap notes error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Create global notification
// @route   POST /api/admin/notifications/global
// @access  Private/Admin
router.post('/notifications/global', async (req, res) => {
    try {
        const { title, message, priority } = req.body;

        const notification = await Notification.createGlobalNotification(title, message, priority);

        res.status(201).json(notification);
    } catch (error) {
        console.error('Create global notification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res) => {
    try {
        // User statistics
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: { $sum: { $cond: [{ $eq: ['$isBanned', false] }, 1, 0] } },
                    bannedUsers: { $sum: { $cond: [{ $eq: ['$isBanned', true] }, 1, 0] } },
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);

        // Swap statistics
        const swapStats = await Swap.aggregate([
            {
                $group: {
                    _id: null,
                    totalSwaps: { $sum: 1 },
                    pendingSwaps: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                    acceptedSwaps: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
                    completedSwaps: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                    rejectedSwaps: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
                }
            }
        ]);

        // Monthly user registrations
        const monthlyRegistrations = await User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        // Popular skills
        const popularSkills = await User.aggregate([
            { $unwind: '$skillsOffering' },
            { $group: { _id: '$skillsOffering.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            users: userStats[0] || {},
            swaps: swapStats[0] || {},
            monthlyRegistrations,
            popularSkills
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Export data
// @route   GET /api/admin/export/:type
// @access  Private/Admin
router.get('/export/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { format = 'json' } = req.query;

        let data;
        let filename;

        switch (type) {
            case 'users':
                data = await User.find().select('-password');
                filename = 'users-export';
                break;
            case 'swaps':
                data = await Swap.find()
                    .populate('requester', 'name email')
                    .populate('recipient', 'name email');
                filename = 'swaps-export';
                break;
            case 'notifications':
                data = await Notification.find()
                    .populate('recipient', 'name email');
                filename = 'notifications-export';
                break;
            default:
                return res.status(400).json({ error: 'Invalid export type' });
        }

        if (format === 'csv') {
            // Simple CSV conversion (you might want to use a library like 'json2csv')
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
            res.send(JSON.stringify(data));
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
            res.json(data);
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 