const express = require('express');
const router = express.Router();
const Swap = require('../models/Swap');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @desc    Create a new swap request
// @route   POST /api/swaps
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { recipientId, requesterSkill, recipientSkill, message, scheduledDate } = req.body;

        // Check if recipient exists and is not banned
        const recipient = await User.findById(recipientId);
        if (!recipient || recipient.isBanned) {
            return res.status(404).json({ error: 'Recipient not found' });
        }

        // Check if user is trying to swap with themselves
        if (req.user._id.toString() === recipientId) {
            return res.status(400).json({ error: 'Cannot create swap with yourself' });
        }

        // Check if there's already a pending swap between these users
        const existingSwap = await Swap.findOne({
            $or: [
                { requester: req.user._id, recipient: recipientId },
                { requester: recipientId, recipient: req.user._id }
            ],
            status: { $in: ['pending', 'accepted'] }
        });

        if (existingSwap) {
            return res.status(400).json({ error: 'A swap request already exists between you and this user' });
        }

        // Create the swap
        const swap = await Swap.create({
            requester: req.user._id,
            recipient: recipientId,
            requesterSkill,
            recipientSkill,
            message,
            scheduledDate
        });

        // Create notification for recipient
        await Notification.create({
            recipient: recipientId,
            type: 'swap_request',
            title: 'New Skill Swap Request',
            message: `${req.user.name} wants to swap skills with you!`,
            relatedSwap: swap._id,
            relatedUser: req.user._id
        });

        // Populate user details for response
        await swap.populate('requester', 'name email profileImage');
        await swap.populate('recipient', 'name email profileImage');

        res.status(201).json(swap);
    } catch (error) {
        console.error('Create swap error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Get user's swaps
// @route   GET /api/swaps
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        let query = {
            $or: [
                { requester: req.user._id },
                { recipient: req.user._id }
            ]
        };

        if (status) {
            query.status = status;
        }

        const swaps = await Swap.find(query)
            .populate('requester', 'name email profileImage')
            .populate('recipient', 'name email profileImage')
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

// @desc    Get swap by ID
// @route   GET /api/swaps/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id)
            .populate('requester', 'name email profileImage')
            .populate('recipient', 'name email profileImage');

        if (!swap) {
            return res.status(404).json({ error: 'Swap not found' });
        }

        // Check if user is part of this swap
        if (swap.requester._id.toString() !== req.user._id.toString() && 
            swap.recipient._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to view this swap' });
        }

        res.json(swap);
    } catch (error) {
        console.error('Get swap error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Accept swap request
// @route   PUT /api/swaps/:id/accept
// @access  Private
router.put('/:id/accept', protect, async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ error: 'Swap not found' });
        }

        // Check if user is the recipient
        if (swap.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to accept this swap' });
        }

        if (swap.status !== 'pending') {
            return res.status(400).json({ error: 'Swap is not in pending status' });
        }

        swap.status = 'accepted';
        await swap.save();

        // Create notification for requester
        await Notification.create({
            recipient: swap.requester,
            type: 'swap_accepted',
            title: 'Swap Request Accepted!',
            message: `${req.user.name} accepted your skill swap request!`,
            relatedSwap: swap._id,
            relatedUser: req.user._id
        });

        await swap.populate('requester', 'name email profileImage');
        await swap.populate('recipient', 'name email profileImage');

        res.json(swap);
    } catch (error) {
        console.error('Accept swap error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Reject swap request
// @route   PUT /api/swaps/:id/reject
// @access  Private
router.put('/:id/reject', protect, async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ error: 'Swap not found' });
        }

        // Check if user is the recipient
        if (swap.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to reject this swap' });
        }

        if (swap.status !== 'pending') {
            return res.status(400).json({ error: 'Swap is not in pending status' });
        }

        swap.status = 'rejected';
        await swap.save();

        // Create notification for requester
        await Notification.create({
            recipient: swap.requester,
            type: 'swap_rejected',
            title: 'Swap Request Rejected',
            message: `${req.user.name} rejected your skill swap request.`,
            relatedSwap: swap._id,
            relatedUser: req.user._id
        });

        await swap.populate('requester', 'name email profileImage');
        await swap.populate('recipient', 'name email profileImage');

        res.json(swap);
    } catch (error) {
        console.error('Reject swap error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Cancel swap request
// @route   PUT /api/swaps/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ error: 'Swap not found' });
        }

        // Check if user is the requester
        if (swap.requester.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to cancel this swap' });
        }

        if (swap.status !== 'pending') {
            return res.status(400).json({ error: 'Can only cancel pending swaps' });
        }

        swap.status = 'cancelled';
        await swap.save();

        await swap.populate('requester', 'name email profileImage');
        await swap.populate('recipient', 'name email profileImage');

        res.json(swap);
    } catch (error) {
        console.error('Cancel swap error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Complete swap
// @route   PUT /api/swaps/:id/complete
// @access  Private
router.put('/:id/complete', protect, async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ error: 'Swap not found' });
        }

        // Check if user is part of this swap
        if (swap.requester.toString() !== req.user._id.toString() && 
            swap.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to complete this swap' });
        }

        if (swap.status !== 'accepted') {
            return res.status(400).json({ error: 'Can only complete accepted swaps' });
        }

        swap.status = 'completed';
        swap.completedDate = new Date();
        await swap.save();

        // Create notification for the other user
        const otherUserId = swap.requester.toString() === req.user._id.toString() 
            ? swap.recipient 
            : swap.requester;

        await Notification.create({
            recipient: otherUserId,
            type: 'swap_completed',
            title: 'Swap Completed!',
            message: `${req.user.name} marked the swap as completed.`,
            relatedSwap: swap._id,
            relatedUser: req.user._id
        });

        await swap.populate('requester', 'name email profileImage');
        await swap.populate('recipient', 'name email profileImage');

        res.json(swap);
    } catch (error) {
        console.error('Complete swap error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Rate swap
// @route   POST /api/swaps/:id/rate
// @access  Private
router.post('/:id/rate', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const swap = await Swap.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ error: 'Swap not found' });
        }

        // Check if user is part of this swap
        if (swap.requester.toString() !== req.user._id.toString() && 
            swap.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to rate this swap' });
        }

        if (swap.status !== 'completed') {
            return res.status(400).json({ error: 'Can only rate completed swaps' });
        }

        // Add rating
        await swap.addRating(req.user._id, rating, comment);

        // Update user rating
        const otherUserId = swap.requester.toString() === req.user._id.toString() 
            ? swap.recipient 
            : swap.requester;
        
        const otherUser = await User.findById(otherUserId);
        if (otherUser) {
            await otherUser.updateRating(rating);
        }

        // Create notification
        await Notification.create({
            recipient: otherUserId,
            type: 'rating_received',
            title: 'You received a rating!',
            message: `${req.user.name} rated your skill swap ${rating}/5 stars.`,
            relatedSwap: swap._id,
            relatedUser: req.user._id
        });

        await swap.populate('requester', 'name email profileImage');
        await swap.populate('recipient', 'name email profileImage');

        res.json(swap);
    } catch (error) {
        console.error('Rate swap error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 