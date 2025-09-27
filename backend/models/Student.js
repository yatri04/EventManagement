const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    studentId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        maxlength: [20, 'Student ID cannot exceed 20 characters']
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    department: {
        type: String,
        trim: true,
        maxlength: [100, 'Department cannot exceed 100 characters']
    },
    year: {
        type: String,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Other'],
        default: '1st Year'
    },
    profileImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    registeredEvents: [{
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['registered', 'cancelled', 'waiting'],
            default: 'registered'
        }
    }],
    isAdmin: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to register for an event
studentSchema.methods.registerForEvent = async function(eventId) {
    // Check if already registered
    const existingRegistration = this.registeredEvents.find(
        reg => reg.eventId.toString() === eventId.toString() && reg.status === 'registered'
    );
    
    if (existingRegistration) {
        throw new Error('Already registered for this event');
    }

    // Add to registered events
    this.registeredEvents.push({
        eventId: eventId,
        registeredAt: new Date(),
        status: 'registered'
    });

    return this.save();
};

// Method to cancel event registration
studentSchema.methods.cancelEventRegistration = async function(eventId) {
    const registration = this.registeredEvents.find(
        reg => reg.eventId.toString() === eventId.toString() && reg.status === 'registered'
    );
    
    if (!registration) {
        throw new Error('Not registered for this event');
    }

    registration.status = 'cancelled';
    return this.save();
};

// Method to get registered events
studentSchema.methods.getRegisteredEvents = function() {
    return this.registeredEvents.filter(reg => reg.status === 'registered');
};

// Index for better query performance
studentSchema.index({ email: 1 });
studentSchema.index({ studentId: 1 });
studentSchema.index({ 'registeredEvents.eventId': 1 });

module.exports = mongoose.model('Student', studentSchema);
