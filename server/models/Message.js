const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'payment_request', 'payment_confirmation'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours from now
    }
  },
  paymentData: {
    amount: { type: Number, default: null },
    upiId: { type: String, default: null },
    transactionId: { type: String, default: null },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: null 
    }
  }
}, {
  timestamps: true
});

// Index for automatic cleanup
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = function(userId1, userId2, limit = 50) {
  return this.find({
    $or: [
      { sender: userId1, recipient: userId2 },
      { sender: userId2, recipient: userId1 }
    ]
  })
  .populate('sender', 'username profilePicture')
  .populate('recipient', 'username profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get unread message count
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false
  });
};

module.exports = mongoose.model('Message', messageSchema);