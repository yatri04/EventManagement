const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Student = require('../models/Student');
const { protect: auth } = require('../middleware/auth');

// @route   POST /api/events
// @desc    Create a new event
// @access  Admin only
router.post('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.student.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const {
            eventName,
            description,
            date,
            capacity,
            location,
            organizer,
            organizerEmail,
            registrationDeadline,
            tags
        } = req.body;

        // Validate required fields
        if (!eventName || !date || !capacity || !organizer || !organizerEmail) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: eventName, date, capacity, organizer, organizerEmail'
            });
        }

        // Create new event
        const event = new Event({
            eventName,
            description,
            date: new Date(date),
            capacity: parseInt(capacity),
            location,
            organizer,
            organizerEmail,
            registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
            tags: tags || []
        });

        await event.save();

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: {
                eventId: event._id,
                eventName: event.eventName,
                date: event.date,
                capacity: event.capacity,
                availableSeats: event.availableSeats,
                registrationStatus: event.registrationStatus
            }
        });

    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating event',
            error: error.message
        });
    }
});

// @route   GET /api/events
// @desc    Get all events with available seats
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'all', search = '' } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        let query = { isActive: true };
        
        // Filter by registration status
        if (status === 'open') {
            query.date = { $gt: new Date() };
        } else if (status === 'full') {
            // Events that are full but not past
            query.date = { $gt: new Date() };
        } else if (status === 'past') {
            query.date = { $lte: new Date() };
        }

        // Search functionality
        if (search) {
            query.$or = [
                { eventName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { organizer: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const events = await Event.find(query)
            .populate('participants.studentId', 'name email')
            .populate('waitingList.studentId', 'name email')
            .sort({ date: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Add virtual fields to response
        const eventsWithVirtuals = events.map(event => {
            const eventObj = event.toObject();
            eventObj.availableSeats = event.availableSeats;
            eventObj.registrationStatus = event.registrationStatus;
            eventObj.participantCount = event.participants.filter(p => p.status === 'registered').length;
            eventObj.waitingListCount = event.waitingList.length;
            return eventObj;
        });

        const total = await Event.countDocuments(query);

        res.json({
            success: true,
            data: {
                events: eventsWithVirtuals,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalEvents: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message
        });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('participants.studentId', 'name email studentId department year')
            .populate('waitingList.studentId', 'name email studentId department year');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const eventObj = event.toObject();
        eventObj.availableSeats = event.availableSeats;
        eventObj.registrationStatus = event.registrationStatus;
        eventObj.participantCount = event.participants.filter(p => p.status === 'registered').length;
        eventObj.waitingListCount = event.waitingList.length;

        res.json({
            success: true,
            data: eventObj
        });

    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event',
            error: error.message
        });
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Admin only
router.put('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.student.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const updates = req.body;
        
        // Convert date strings to Date objects
        if (updates.date) updates.date = new Date(updates.date);
        if (updates.registrationDeadline) updates.registrationDeadline = new Date(updates.registrationDeadline);

        Object.assign(event, updates);
        await event.save();

        res.json({
            success: true,
            message: 'Event updated successfully',
            data: {
                eventId: event._id,
                eventName: event.eventName,
                date: event.date,
                capacity: event.capacity,
                availableSeats: event.availableSeats,
                registrationStatus: event.registrationStatus
            }
        });

    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating event',
            error: error.message
        });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Admin only
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.student.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Soft delete by setting isActive to false
        event.isActive = false;
        await event.save();

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });
    }
});

module.exports = router;
