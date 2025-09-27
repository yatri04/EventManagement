const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect, generateToken } = require('../middleware/auth');

// @desc    Register student
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, studentId, phone, department, year, bio } = req.body;

        // Check if student exists
        const studentExists = await Student.findOne({ email });
        if (studentExists) {
            return res.status(400).json({ 
                success: false,
                message: 'Student already exists with this email' 
            });
        }

        // Create student
        const student = await Student.create({
            name,
            email,
            password,
            studentId,
            phone,
            department,
            year,
            bio
        });

        if (student) {
            res.status(201).json({
                success: true,
                message: 'Student registered successfully',
                data: {
                    _id: student._id,
                    name: student.name,
                    email: student.email,
                    studentId: student.studentId,
                    phone: student.phone,
                    department: student.department,
                    year: student.year,
                    bio: student.bio,
                    profileImage: student.profileImage,
                    isAdmin: student.isAdmin,
                    token: generateToken(student._id)
                }
            });
        } else {
            res.status(400).json({ 
                success: false,
                message: 'Invalid student data' 
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
});

// @desc    Login student
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find student by email
        const student = await Student.findOne({ email }).select('+password');

        if (student && (await student.comparePassword(password))) {
            if (!student.isActive) {
                return res.status(403).json({ 
                    success: false,
                    message: 'Account has been deactivated' 
                });
            }

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    _id: student._id,
                    name: student.name,
                    email: student.email,
                    studentId: student.studentId,
                    phone: student.phone,
                    department: student.department,
                    year: student.year,
                    bio: student.bio,
                    profileImage: student.profileImage,
                    isAdmin: student.isAdmin,
                    token: generateToken(student._id)
                }
            });
        } else {
            res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
});

// @desc    Get current student profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const student = await Student.findById(req.student._id)
            .populate('registeredEvents.eventId', 'eventName date location');
        
        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
});

// @desc    Update student profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const student = await Student.findById(req.student._id);

        if (student) {
            student.name = req.body.name || student.name;
            student.email = req.body.email || student.email;
            student.studentId = req.body.studentId || student.studentId;
            student.phone = req.body.phone || student.phone;
            student.department = req.body.department || student.department;
            student.year = req.body.year || student.year;
            student.bio = req.body.bio || student.bio;
            student.profileImage = req.body.profileImage || student.profileImage;

            if (req.body.password) {
                student.password = req.body.password;
            }

            const updatedStudent = await student.save();

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    _id: updatedStudent._id,
                    name: updatedStudent.name,
                    email: updatedStudent.email,
                    studentId: updatedStudent.studentId,
                    phone: updatedStudent.phone,
                    department: updatedStudent.department,
                    year: updatedStudent.year,
                    bio: updatedStudent.bio,
                    profileImage: updatedStudent.profileImage,
                    isAdmin: updatedStudent.isAdmin,
                    token: generateToken(updatedStudent._id)
                }
            });
        } else {
            res.status(404).json({ 
                success: false,
                message: 'Student not found' 
            });
        }
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const student = await Student.findById(req.student._id).select('+password');

        if (!student) {
            return res.status(404).json({ 
                success: false,
                message: 'Student not found' 
            });
        }

        // Check current password
        const isMatch = await student.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: 'Current password is incorrect' 
            });
        }

        // Update password
        student.password = newPassword;
        await student.save();

        res.json({ 
            success: true,
            message: 'Password updated successfully' 
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
});

module.exports = router; 