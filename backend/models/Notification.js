const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['swap_request', 'swap_accepted', 'swap_rejected', 'swap_completed', 'rating_received', 'admin_announcement', 'account_banned'],
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
        type: String,
        required: true,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    relatedSwap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Swap'
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isGlobal: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    }
}, {
    timestamps: true
});

// Index for better query performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ isGlobal: 1, createdAt: -1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
    this.isRead = true;
    return this.save();
};

// Static method to create global notification
notificationSchema.statics.createGlobalNotification = function(title, message, priority = 'medium') {
    return this.create({
        recipient: null,
        type: 'admin_announcement',
        title,
        message,
        isGlobal: true,
        priority
    });
};

module.exports = mongoose.model('Notification', notificationSchema); 