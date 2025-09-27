const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true,
        maxlength: [100, 'Event name cannot exceed 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    date: {
        type: Date,
        required: [true, 'Event date is required'],
        validate: {
            validator: function(date) {
                return date > new Date();
            },
            message: 'Event date must be in the future'
        }
    },
    capacity: {
        type: Number,
        required: [true, 'Event capacity is required'],
        min: [1, 'Capacity must be at least 1'],
        max: [1000, 'Capacity cannot exceed 1000']
    },
    location: {
        type: String,
        trim: true,
        maxlength: [200, 'Location cannot exceed 200 characters']
    },
    organizer: {
        type: String,
        required: [true, 'Organizer name is required'],
        trim: true,
        maxlength: [100, 'Organizer name cannot exceed 100 characters']
    },
    organizerEmail: {
        type: String,
        required: [true, 'Organizer email is required'],
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    participants: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['registered', 'cancelled'],
            default: 'registered'
        }
    }],
    waitingList: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        },
        position: {
            type: Number,
            required: true
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    registrationDeadline: {
        type: Date,
        validate: {
            validator: function(deadline) {
                return deadline < this.date;
            },
            message: 'Registration deadline must be before event date'
        }
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }]
}, {
    timestamps: true
});

// Virtual for available seats
eventSchema.virtual('availableSeats').get(function() {
    const activeParticipants = this.participants.filter(p => p.status === 'registered').length;
    return this.capacity - activeParticipants;
});

// Virtual for registration status
eventSchema.virtual('registrationStatus').get(function() {
    const now = new Date();
    if (this.registrationDeadline && now > this.registrationDeadline) {
        return 'closed';
    }
    if (this.availableSeats <= 0) {
        return 'full';
    }
    if (now > this.date) {
        return 'past';
    }
    return 'open';
});

// Method to register a student
eventSchema.methods.registerStudent = async function(studentId) {
    // Check if student is already registered
    const existingParticipant = this.participants.find(p => 
        p.studentId.toString() === studentId.toString() && p.status === 'registered'
    );
    
    if (existingParticipant) {
        throw new Error('Student is already registered for this event');
    }

    // Check if registration is open
    if (this.registrationStatus !== 'open') {
        throw new Error('Registration is not open for this event');
    }

    // Check if there are available seats
    if (this.availableSeats > 0) {
        // Register student
        this.participants.push({
            studentId: studentId,
            registeredAt: new Date(),
            status: 'registered'
        });
        return { status: 'registered', message: 'Successfully registered for the event' };
    } else {
        // Add to waiting list
        const waitingListPosition = this.waitingList.length + 1;
        this.waitingList.push({
            studentId: studentId,
            addedAt: new Date(),
            position: waitingListPosition
        });
        return { 
            status: 'waiting', 
            message: `Event is full. Added to waiting list at position ${waitingListPosition}`,
            position: waitingListPosition
        };
    }
};

// Method to cancel registration
eventSchema.methods.cancelRegistration = async function(studentId) {
    const participantIndex = this.participants.findIndex(p => 
        p.studentId.toString() === studentId.toString() && p.status === 'registered'
    );
    
    if (participantIndex === -1) {
        throw new Error('Student is not registered for this event');
    }

    // Mark as cancelled
    this.participants[participantIndex].status = 'cancelled';

    // If there's someone on the waiting list, move them to participants
    if (this.waitingList.length > 0) {
        const nextInLine = this.waitingList.shift();
        this.participants.push({
            studentId: nextInLine.studentId,
            registeredAt: new Date(),
            status: 'registered'
        });

        // Update positions for remaining waiting list
        this.waitingList.forEach((item, index) => {
            item.position = index + 1;
        });

        return { 
            status: 'cancelled', 
            message: 'Registration cancelled and next person from waiting list has been registered',
            movedFromWaitingList: true
        };
    }

    return { status: 'cancelled', message: 'Registration cancelled successfully' };
};

// Index for better query performance
eventSchema.index({ date: 1, isActive: 1 });
eventSchema.index({ 'participants.studentId': 1 });
eventSchema.index({ 'waitingList.studentId': 1 });

module.exports = mongoose.model('Event', eventSchema);
