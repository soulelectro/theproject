const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: 1,
    max: 100000 // Max ₹1,00,000
  },
  currency: {
    type: String,
    default: 'INR'
  },
  description: {
    type: String,
    maxlength: 200,
    default: ''
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'qr_code'],
    default: 'upi'
  },
  senderUpiId: {
    type: String,
    required: true
  },
  recipientUpiId: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  failureReason: {
    type: String,
    default: null
  },
  qrCodeData: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours from now
    }
  },
  completedAt: {
    type: Date,
    default: null
  },
  metadata: {
    deviceInfo: { type: String, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null }
  }
}, {
  timestamps: true
});

// Index for automatic cleanup
paymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient queries
paymentSchema.index({ sender: 1, createdAt: -1 });
paymentSchema.index({ recipient: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Method to mark payment as completed
paymentSchema.methods.markCompleted = function(razorpayPaymentId = null) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (razorpayPaymentId) {
    this.razorpayPaymentId = razorpayPaymentId;
  }
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

// Static method to get user's payment history
paymentSchema.statics.getUserPayments = function(userId, limit = 50) {
  return this.find({
    $or: [
      { sender: userId },
      { recipient: userId }
    ]
  })
  .populate('sender', 'username phoneNumber')
  .populate('recipient', 'username phoneNumber')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get pending payments for a user
paymentSchema.statics.getPendingPayments = function(userId) {
  return this.find({
    $or: [
      { sender: userId, status: 'pending' },
      { recipient: userId, status: 'pending' }
    ]
  })
  .populate('sender', 'username phoneNumber')
  .populate('recipient', 'username phoneNumber')
  .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Payment', paymentSchema);