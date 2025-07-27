const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    match: /^[+]?[1-9]\d{1,14}$/
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  verified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for automatic cleanup
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient queries
otpSchema.index({ phoneNumber: 1, createdAt: -1 });

// Method to verify OTP
otpSchema.methods.verifyOTP = function(inputOtp) {
  if (this.verified) {
    return { success: false, message: 'OTP already verified' };
  }
  
  if (this.expiresAt < new Date()) {
    return { success: false, message: 'OTP has expired' };
  }
  
  if (this.attempts >= 3) {
    return { success: false, message: 'Maximum attempts exceeded' };
  }
  
  this.attempts += 1;
  
  if (this.otp === inputOtp) {
    this.verified = true;
    this.save();
    return { success: true, message: 'OTP verified successfully' };
  } else {
    this.save();
    return { 
      success: false, 
      message: `Invalid OTP. ${3 - this.attempts} attempts remaining` 
    };
  }
};

// Static method to generate OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create new OTP
otpSchema.statics.createOTP = async function(phoneNumber) {
  // Delete any existing OTPs for this phone number
  await this.deleteMany({ phoneNumber });
  
  const otp = this.generateOTP();
  const newOTP = new this({
    phoneNumber,
    otp
  });
  
  await newOTP.save();
  return newOTP;
};

module.exports = mongoose.model('OTP', otpSchema);