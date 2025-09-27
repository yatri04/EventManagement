const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Student = require('../models/Student');
const { protect: auth } = require('../middleware/auth');

// @route   GET /api/admin/events/:id/participants
// @desc    Get participants and waiting list for an event
// @access  Admin only
router.get('/events/:id/participants', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.student.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const event = await Event.findById(req.params.id)
            .populate('participants.studentId', 'name email studentId department year phone')
            .populate('waitingList.studentId', 'name email studentId department year phone');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Separate registered participants and cancelled ones
        const registeredParticipants = event.participants
            .filter(p => p.status === 'registered')
            .map(p => ({
                studentId: p.studentId._id,
                name: p.studentId.name,
                email: p.studentId.email,
                studentIdNumber: p.studentId.studentId,
                department: p.studentId.department,
                year: p.studentId.year,
                phone: p.studentId.phone,
                registeredAt: p.registeredAt
            }));

        const cancelledParticipants = event.participants
            .filter(p => p.status === 'cancelled')
            .map(p => ({
                studentId: p.studentId._id,
                name: p.studentId.name,
                email: p.studentId.email,
                studentIdNumber: p.studentId.studentId,
                department: p.studentId.department,
                year: p.studentId.year,
                phone: p.studentId.phone,
                registeredAt: p.registeredAt
            }));

        const waitingList = event.waitingList.map(w => ({
            studentId: w.studentId._id,
            name: w.studentId.name,
            email: w.studentId.email,
            studentIdNumber: w.studentId.studentId,
            department: w.studentId.department,
            year: w.studentId.year,
            phone: w.studentId.phone,
            position: w.position,
            addedAt: w.addedAt
        }));

        res.json({
            success: true,
            data: {
                event: {
                    id: event._id,
                    eventName: event.eventName,
                    date: event.date,
                    capacity: event.capacity,
                    location: event.location,
                    organizer: event.organizer
                },
                participants: {
                    registered: registeredParticipants,
                    cancelled: cancelledParticipants,
                    totalRegistered: registeredParticipants.length,
                    totalCancelled: cancelledParticipants.length
                },
                waitingList: {
                    students: waitingList,
                    totalWaiting: waitingList.length
                },
                summary: {
                    totalCapacity: event.capacity,
                    registeredCount: registeredParticipants.length,
                    availableSeats: event.capacity - registeredParticipants.length,
                    waitingListCount: waitingList.length,
                    registrationStatus: event.registrationStatus
                }
            }
        });

    } catch (error) {
        console.error('Error fetching event participants:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event participants',
            error: error.message
        });
    }
});

// @route   GET /api/admin/events
// @desc    Get all events for admin dashboard
// @access  Admin only
router.get('/events', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.student.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const { page = 1, limit = 10, status = 'all' } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};

        if (status === 'active') {
            query.isActive = true;
        } else if (status === 'inactive') {
            query.isActive = false;
        }

        const events = await Event.find(query)
            .populate('participants.studentId', 'name email')
            .populate('waitingList.studentId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Add virtual fields and statistics
        const eventsWithStats = events.map(event => {
            const eventObj = event.toObject();
            const registeredCount = event.participants.filter(p => p.status === 'registered').length;
            const cancelledCount = event.participants.filter(p => p.status === 'cancelled').length;
            
            eventObj.availableSeats = event.availableSeats;
            eventObj.registrationStatus = event.registrationStatus;
            eventObj.registeredCount = registeredCount;
            eventObj.cancelledCount = cancelledCount;
            eventObj.waitingListCount = event.waitingList.length;
            eventObj.occupancyRate = Math.round((registeredCount / event.capacity) * 100);
            
            return eventObj;
        });

        const total = await Event.countDocuments(query);

        res.json({
            success: true,
            data: {
                events: eventsWithStats,
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
        console.error('Error fetching admin events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message
        });
    }
});

// @route   GET /api/admin/students
// @desc    Get all students for admin management
// @access  Admin only
router.get('/students', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.student.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } }
            ];
        }

        const students = await Student.find(query)
            .populate('registeredEvents.eventId', 'eventName date')
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Add registration count
        const studentsWithStats = students.map(student => {
            const studentObj = student.toObject();
            studentObj.registeredEventsCount = student.registeredEvents.filter(reg => reg.status === 'registered').length;
            return studentObj;
        });

        const total = await Student.countDocuments(query);

        res.json({
            success: true,
            data: {
                students: studentsWithStats,
            pagination: {
                    currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                    totalStudents: total,
                    hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/dashboard', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.student.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        // Get statistics
        const totalEvents = await Event.countDocuments();
        const activeEvents = await Event.countDocuments({ isActive: true });
        const totalStudents = await Student.countDocuments();
        const activeStudents = await Student.countDocuments({ isActive: true });

        // Get upcoming events
        const upcomingEvents = await Event.find({
            date: { $gt: new Date() },
            isActive: true
        })
        .populate('participants.studentId', 'name')
        .sort({ date: 1 })
        .limit(5);

        // Get recent registrations
        const recentRegistrations = await Event.aggregate([
            { $unwind: '$participants' },
            { $match: { 'participants.status': 'registered' } },
            { $sort: { 'participants.registeredAt': -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'students',
                    localField: 'participants.studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'event'
                }
            },
            {
                $project: {
                    studentName: { $arrayElemAt: ['$student.name', 0] },
                    studentEmail: { $arrayElemAt: ['$student.email', 0] },
                    eventName: { $arrayElemAt: ['$event.eventName', 0] },
                    eventDate: { $arrayElemAt: ['$event.date', 0] },
                    registeredAt: '$participants.registeredAt'
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                statistics: {
                    totalEvents,
                    activeEvents,
                    totalStudents,
                    activeStudents
                },
                upcomingEvents: upcomingEvents.map(event => ({
                    id: event._id,
                    eventName: event.eventName,
                    date: event.date,
                    capacity: event.capacity,
                    registeredCount: event.participants.filter(p => p.status === 'registered').length,
                    availableSeats: event.availableSeats
                })),
                recentRegistrations
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
});

module.exports = router; 