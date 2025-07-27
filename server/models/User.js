const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^[+]?[1-9]\d{1,14}$/
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30
  },
  sessionStartTime: {
    type: Date,
    default: Date.now
  },
  sessionEndTime: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours from now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  upiId: {
    type: String,
    default: null
  },
  socialLinks: {
    instagram: { type: String, default: null },
    discord: { type: String, default: null },
    reddit: { type: String, default: null },
    snapchat: { type: String, default: null },
    twitter: { type: String, default: null }
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 150,
    default: ''
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  otpVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for automatic cleanup
userSchema.index({ sessionEndTime: 1 }, { expireAfterSeconds: 0 });

// Virtual for session time remaining
userSchema.virtual('sessionTimeRemaining').get(function() {
  const now = new Date();
  const endTime = this.sessionEndTime;
  const remaining = endTime - now;
  
  if (remaining <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds, expired: false };
});

// Method to check if session is expired
userSchema.methods.isSessionExpired = function() {
  return new Date() > this.sessionEndTime;
};

// Method to extend session (reset to 5 hours)
userSchema.methods.extendSession = function() {
  this.sessionStartTime = new Date();
  this.sessionEndTime = new Date(Date.now() + 5 * 60 * 60 * 1000);
  this.lastActive = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);