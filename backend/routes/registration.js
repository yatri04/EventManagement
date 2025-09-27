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
        
        // Save the event with updated participants
        await event.save();
        
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

        // Send cancellation email
        try {
            await sendCancellationEmail(req.student, event);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the cancellation if email fails
        }

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
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Email configuration not set. Please configure EMAIL_USER and EMAIL_PASS in your environment variables.');
        console.log('📧 Email would have been sent to:', student.email);
        console.log('📋 Event:', event.eventName);
        console.log('📊 Status:', registrationResult.status);
        return;
    }

    try {
        const mailOptions = {
            from: `"Event Registration System" <${process.env.EMAIL_USER}>`,
            to: student.email,
            subject: `🎟️ Event Registration Confirmation - ${event.eventName}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px;">🎟️ Event Registration System</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Registration Confirmation</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: white;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear <strong>${student.name}</strong>,</p>
                        
                        <p style="color: #666; line-height: 1.6;">Your registration for the event has been successfully processed. Here are the details:</p>
                        
                        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #667eea;">
                            <h3 style="margin-top: 0; color: #333; font-size: 20px;">📅 Event Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Event Name:</td>
                                    <td style="padding: 8px 0; color: #333;">${event.eventName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Date:</td>
                                    <td style="padding: 8px 0; color: #333;">${new Date(event.date).toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Time:</td>
                                    <td style="padding: 8px 0; color: #333;">${new Date(event.date).toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}</td>
                                </tr>
                                ${event.location ? `
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Location:</td>
                                    <td style="padding: 8px 0; color: #333;">${event.location}</td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Capacity:</td>
                                    <td style="padding: 8px 0; color: #333;">${event.capacity} seats</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Available:</td>
                                    <td style="padding: 8px 0; color: #333;">${event.availableSeats} seats remaining</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="background-color: ${registrationResult.status === 'registered' ? '#d4edda' : '#fff3cd'}; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid ${registrationResult.status === 'registered' ? '#c3e6cb' : '#ffeaa7'};">
                            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                <span style="font-size: 24px; margin-right: 10px;">
                                    ${registrationResult.status === 'registered' ? '✅' : '⏳'}
                                </span>
                                <h4 style="margin: 0; color: ${registrationResult.status === 'registered' ? '#155724' : '#856404'}; font-size: 18px;">
                                    ${registrationResult.status === 'registered' ? 'Registration Confirmed!' : 'Added to Waiting List'}
                                </h4>
                            </div>
                            <p style="margin: 0 0 10px 0; color: ${registrationResult.status === 'registered' ? '#155724' : '#856404'};">
                                ${registrationResult.message}
                            </p>
                            ${registrationResult.position ? `
                            <p style="margin: 0; color: ${registrationResult.status === 'registered' ? '#155724' : '#856404'}; font-weight: bold;">
                                Your position in waiting list: #${registrationResult.position}
                            </p>
                            ` : ''}
                            ${registrationResult.status === 'registered' ? `
                            <p style="margin: 10px 0 0 0; color: #155724; font-size: 14px;">
                                🎉 You're all set! We look forward to seeing you at the event.
                            </p>
                            ` : `
                            <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px;">
                                📧 We'll notify you if a seat becomes available.
                            </p>
                            `}
                        </div>
                        
                        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
                            <h4 style="margin: 0 0 10px 0; color: #1976d2;">📱 Need Help?</h4>
                            <p style="margin: 0; color: #666; font-size: 14px;">
                                If you have any questions about this event, please contact the event organizer or visit our support page.
                            </p>
                        </div>
                        
                        <p style="color: #333; margin-top: 30px;">Thank you for your interest in our event!</p>
                        
                        <p style="color: #666; font-size: 14px; margin-top: 20px;">
                            Best regards,<br>
                            Event Registration System Team
                        </p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
                        <p style="color: #6c757d; font-size: 12px; margin: 0;">
                            This is an automated message. Please do not reply to this email.<br>
                            © ${new Date().getFullYear()} Event Registration System. All rights reserved.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Registration email sent successfully to ${student.email}`);
        console.log(`📧 Event: ${event.eventName}`);
        console.log(`📊 Status: ${registrationResult.status}`);
        
    } catch (error) {
        console.error('❌ Failed to send registration email:', error);
        throw error;
    }
}

// Helper function to send cancellation email
async function sendCancellationEmail(student, event) {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Email configuration not set. Please configure EMAIL_USER and EMAIL_PASS in your environment variables.');
        console.log('📧 Cancellation email would have been sent to:', student.email);
        console.log('📋 Event:', event.eventName);
        return;
    }

    try {
        const mailOptions = {
            from: `"Event Registration System" <${process.env.EMAIL_USER}>`,
            to: student.email,
            subject: `❌ Event Registration Cancelled - ${event.eventName}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
                    <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px;">❌ Registration Cancelled</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Event Registration System</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: white;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear <strong>${student.name}</strong>,</p>
                        
                        <p style="color: #666; line-height: 1.6;">Your registration for the following event has been successfully cancelled:</p>
                        
                        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #dc3545;">
                            <h3 style="margin-top: 0; color: #333; font-size: 20px;">📅 Event Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Event Name:</td>
                                    <td style="padding: 8px 0; color: #333;">${event.eventName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Date:</td>
                                    <td style="padding: 8px 0; color: #333;">${new Date(event.date).toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Time:</td>
                                    <td style="padding: 8px 0; color: #333;">${new Date(event.date).toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}</td>
                                </tr>
                                ${event.location ? `
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #555;">Location:</td>
                                    <td style="padding: 8px 0; color: #333;">${event.location}</td>
                                </tr>
                                ` : ''}
                            </table>
                        </div>
                        
                        <div style="background-color: #f8d7da; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #f5c6cb;">
                            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                <span style="font-size: 24px; margin-right: 10px;">❌</span>
                                <h4 style="margin: 0; color: #721c24; font-size: 18px;">
                                    Registration Cancelled
                                </h4>
                            </div>
                            <p style="margin: 0; color: #721c24;">
                                Your registration has been successfully cancelled. If you change your mind, you can register again if seats are still available.
                            </p>
                        </div>
                        
                        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
                            <h4 style="margin: 0 0 10px 0; color: #1976d2;">🔄 Want to Register Again?</h4>
                            <p style="margin: 0; color: #666; font-size: 14px;">
                                If you change your mind, you can register for this event again if seats are still available.
                            </p>
                        </div>
                        
                        <p style="color: #333; margin-top: 30px;">Thank you for using our Event Registration System!</p>
                        
                        <p style="color: #666; font-size: 14px; margin-top: 20px;">
                            Best regards,<br>
                            Event Registration System Team
                        </p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
                        <p style="color: #6c757d; font-size: 12px; margin: 0;">
                            This is an automated message. Please do not reply to this email.<br>
                            © ${new Date().getFullYear()} Event Registration System. All rights reserved.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Cancellation email sent successfully to ${student.email}`);
        console.log(`📧 Event: ${event.eventName}`);
        
    } catch (error) {
        console.error('❌ Failed to send cancellation email:', error);
        throw error;
    }
}

module.exports = router;
