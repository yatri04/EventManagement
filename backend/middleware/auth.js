const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Protect routes - require authentication
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get student from token
            req.student = await Student.findById(decoded.id).select('-password');

            if (!req.student) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Student not found' 
                });
            }

            if (!req.student.isActive) {
                return res.status(403).json({ 
                    success: false,
                    message: 'Account has been deactivated' 
                });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ 
                success: false,
                message: 'Not authorized, token failed' 
            });
        }
    }

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Not authorized, no token' 
        });
    }
};

// Admin middleware - require admin privileges
const admin = (req, res, next) => {
    if (req.student && req.student.isAdmin) {
        next();
    } else {
        return res.status(403).json({ 
            success: false,
            message: 'Access denied. Admin privileges required.' 
        });
    }
};

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = { protect, admin, generateToken }; 