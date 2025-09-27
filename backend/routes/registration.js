const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Student = require('../models/Student');
const { protect: auth } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @route   POST /api/register
// @desc    Register a student for an event
// @access  Private (Student must be logged in)
router.post('/', auth, async (req, res) => {
    try {
        const { eventId } = req.body;
        const studentId = req.student._id;

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: 'Event ID is required'
            });
        }

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if event is active
        if (!event.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Event is no longer active'
            });
        }

        // Register student for the event
        const registrationResult = await event.registerStudent(studentId);
        
        // Update student's registered events
        if (registrationResult.status === 'registered') {
            await req.student.registerForEvent(eventId);
        }

        // Send email confirmation
        try {
            await sendRegistrationEmail(req.student, event, registrationResult);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the registration if email fails
        }

        res.json({
            success: true,
            message: registrationResult.message,
            data: {
                eventId: event._id,
                eventName: event.eventName,
                eventDate: event.date,
                registrationStatus: registrationResult.status,
                position: registrationResult.position || null,
                availableSeats: event.availableSeats
            }
        });

    } catch (error) {
        console.error('Error registering for event:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/register/:eventId
// @desc    Cancel event registration
// @access  Private (Student must be logged in)
router.delete('/:eventId', auth, async (req, res) => {
    try {
        const { eventId } = req.params;
        const studentId = req.student._id;

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Cancel registration
        const cancellationResult = await event.cancelRegistration(studentId);
        
        // Update student's registered events
        await req.student.cancelEventRegistration(eventId);

        res.json({
            success: true,
            message: cancellationResult.message,
            data: {
                eventId: event._id,
                eventName: event.eventName,
                movedFromWaitingList: cancellationResult.movedFromWaitingList || false
            }
        });

    } catch (error) {
        console.error('Error cancelling registration:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/register/my-events
// @desc    Get student's registered events
// @access  Private (Student must be logged in)
router.get('/my-events', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.student._id)
            .populate({
                path: 'registeredEvents.eventId',
                model: 'Event',
                select: 'eventName date location capacity organizer'
            });

        const registeredEvents = student.registeredEvents
            .filter(reg => reg.status === 'registered')
            .map(reg => ({
                eventId: reg.eventId._id,
                eventName: reg.eventId.eventName,
                eventDate: reg.eventId.date,
                location: reg.eventId.location,
                capacity: reg.eventId.capacity,
                organizer: reg.eventId.organizer,
                registeredAt: reg.registeredAt,
                status: reg.status
            }));

        res.json({
            success: true,
            data: {
                events: registeredEvents,
                totalEvents: registeredEvents.length
            }
        });

    } catch (error) {
        console.error('Error fetching student events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your events',
            error: error.message
        });
    }
});

// @route   GET /api/register/event/:eventId/status
// @desc    Check student's registration status for an event
// @access  Private (Student must be logged in)
router.get('/event/:eventId/status', auth, async (req, res) => {
    try {
        const { eventId } = req.params;
        const studentId = req.student._id;

        const event = await Event.findById(eventId)
            .populate('participants.studentId', 'name email')
            .populate('waitingList.studentId', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if student is registered
        const participant = event.participants.find(p => 
            p.studentId._id.toString() === studentId.toString() && p.status === 'registered'
        );

        // Check if student is on waiting list
        const waitingListEntry = event.waitingList.find(w => 
            w.studentId._id.toString() === studentId.toString()
        );

        let registrationStatus = 'not_registered';
        let position = null;

        if (participant) {
            registrationStatus = 'registered';
        } else if (waitingListEntry) {
            registrationStatus = 'waiting';
            position = waitingListEntry.position;
        }

        res.json({
            success: true,
            data: {
                eventId: event._id,
                eventName: event.eventName,
                registrationStatus,
                position,
                availableSeats: event.availableSeats,
                totalCapacity: event.capacity,
                participantCount: event.participants.filter(p => p.status === 'registered').length,
                waitingListCount: event.waitingList.length
            }
        });

    } catch (error) {
        console.error('Error checking registration status:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking registration status',
            error: error.message
        });
    }
});

// Helper function to send registration email
async function sendRegistrationEmail(student, event, registrationResult) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email configuration not set, skipping email');
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: `Event Registration Confirmation - ${event.eventName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Event Registration Confirmation</h2>
                <p>Dear ${student.name},</p>
                
                <p>Your registration for the event has been processed:</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Event Details</h3>
                    <p><strong>Event Name:</strong> ${event.eventName}</p>
                    <p><strong>Date:</strong> ${event.date.toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${event.date.toLocaleTimeString()}</p>
                    ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
                    <p><strong>Organizer:</strong> ${event.organizer}</p>
                </div>
                
                <div style="background-color: ${registrationResult.status === 'registered' ? '#d4edda' : '#fff3cd'}; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: ${registrationResult.status === 'registered' ? '#155724' : '#856404'};">
                        ${registrationResult.status === 'registered' ? '✅ Registration Confirmed' : '⏳ Added to Waiting List'}
                    </h4>
                    <p style="margin-bottom: 0;">${registrationResult.message}</p>
                    ${registrationResult.position ? `<p><strong>Your position in waiting list:</strong> ${registrationResult.position}</p>` : ''}
                </div>
                
                <p>Thank you for your interest in our event!</p>
                
                <hr style="margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Registration email sent to ${student.email}`);
}

module.exports = router;
