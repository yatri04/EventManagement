const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requesterSkill: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            required: true
        },
        description: {
            type: String,
            maxlength: [200, 'Skill description cannot exceed 200 characters']
        }
    },
    recipientSkill: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            required: true
        },
        description: {
            type: String,
            maxlength: [200, 'Skill description cannot exceed 200 characters']
        }
    },
    message: {
        type: String,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    scheduledDate: {
        type: Date
    },
    completedDate: {
        type: Date
    },
    requesterRating: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: [300, 'Comment cannot exceed 300 characters']
        },
        date: {
            type: Date
        }
    },
    recipientRating: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: [300, 'Comment cannot exceed 300 characters']
        },
        date: {
            type: Date
        }
    },
    adminNotes: {
        type: String,
        maxlength: [500, 'Admin notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Index for better query performance
swapSchema.index({ requester: 1, status: 1 });
swapSchema.index({ recipient: 1, status: 1 });
swapSchema.index({ status: 1, createdAt: -1 });

// Virtual for checking if swap is active
swapSchema.virtual('isActive').get(function() {
    return ['pending', 'accepted'].includes(this.status);
});

// Method to mark as completed
swapSchema.methods.markCompleted = function() {
    this.status = 'completed';
    this.completedDate = new Date();
    return this.save();
};

// Method to add rating
swapSchema.methods.addRating = function(userId, rating, comment) {
    if (this.requester.toString() === userId.toString()) {
        this.requesterRating = { rating, comment, date: new Date() };
    } else if (this.recipient.toString() === userId.toString()) {
        this.recipientRating = { rating, comment, date: new Date() };
    }
    return this.save();
};

module.exports = mongoose.model('Swap', swapSchema); 