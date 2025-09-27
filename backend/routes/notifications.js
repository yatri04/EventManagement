const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const unreadOnly = req.query.unread === 'true';

        let query = {
            $or: [
                { recipient: req.user._id },
                { isGlobal: true }
            ]
        };

        if (unreadOnly) {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .populate('relatedUser', 'name profileImage')
            .populate('relatedSwap')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            $or: [
                { recipient: req.user._id },
                { isGlobal: true }
            ],
            isRead: false
        });

        res.json({
            notifications,
            unreadCount,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalNotifications: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Check if user owns this notification or it's global
        if (notification.recipient && notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to mark this notification as read' });
        }

        await notification.markAsRead();

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            {
                $or: [
                    { recipient: req.user._id },
                    { isGlobal: true }
                ],
                isRead: false
            },
            { isRead: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Check if user owns this notification
        if (notification.recipient && notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this notification' });
        }

        await notification.deleteOne();

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            $or: [
                { recipient: req.user._id },
                { isGlobal: true }
            ],
            isRead: false
        });

        res.json({ unreadCount: count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 