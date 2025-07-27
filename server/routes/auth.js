const express = require('express');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const User = require('../models/User');
const OTP = require('../models/OTP');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize Twilio client (fallback to console logging if not configured)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Validate phone number format
    const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Create OTP
    const otpRecord = await OTP.createOTP(phoneNumber);

    // Send OTP via Twilio (or log to console in development)
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: `Your temporary social app verification code is: ${otpRecord.otp}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
        console.log(`OTP sent to ${phoneNumber}: ${otpRecord.otp}`);
      } catch (twilioError) {
        console.error('Twilio error:', twilioError);
        // In development, continue without sending SMS
        if (process.env.NODE_ENV !== 'development') {
          return res.status(500).json({ error: 'Failed to send OTP' });
        }
      }
    } else {
      // Development mode - log OTP to console
      console.log(`[DEV] OTP for ${phoneNumber}: ${otpRecord.otp}`);
    }

    res.json({ 
      message: 'OTP sent successfully',
      expiresAt: otpRecord.expiresAt,
      // In development, include OTP in response for testing
      ...(process.env.NODE_ENV === 'development' && { otp: otpRecord.otp })
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and Login/Register
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp, username } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ 
      phoneNumber, 
      verified: false 
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ error: 'No OTP found for this phone number' });
    }

    // Verify OTP
    const verificationResult = otpRecord.verifyOTP(otp);
    
    if (!verificationResult.success) {
      return res.status(400).json({ error: verificationResult.message });
    }

    // Check if user exists
    let user = await User.findOne({ phoneNumber });
    
    if (!user) {
      // New user registration
      if (!username) {
        return res.status(400).json({ 
          error: 'Username is required for new users',
          newUser: true 
        });
      }

      // Check if username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      user = new User({
        phoneNumber,
        username,
        otpVerified: true
      });
      
      await user.save();
    } else {
      // Existing user - extend session
      await user.extendSession();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '5h' }
    );

    // Return user data and token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        username: user.username,
        sessionTimeRemaining: user.sessionTimeRemaining,
        upiId: user.upiId,
        socialLinks: user.socialLinks,
        profilePicture: user.profilePicture,
        bio: user.bio,
        followersCount: user.followers.length,
        followingCount: user.following.length
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Get current user info
router.get('/me', auth, async (req, res) => {
  try {
    const user = await req.user.populate('followers following', 'username profilePicture');
    
    res.json({
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        username: user.username,
        sessionTimeRemaining: user.sessionTimeRemaining,
        upiId: user.upiId,
        socialLinks: user.socialLinks,
        profilePicture: user.profilePicture,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        sessionStartTime: user.sessionStartTime,
        sessionEndTime: user.sessionEndTime,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Extend session
router.post('/extend-session', auth, async (req, res) => {
  try {
    await req.user.extendSession();
    
    res.json({
      message: 'Session extended successfully',
      sessionTimeRemaining: req.user.sessionTimeRemaining,
      sessionEndTime: req.user.sessionEndTime
    });
  } catch (error) {
    console.error('Extend session error:', error);
    res.status(500).json({ error: 'Failed to extend session' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    // Mark user as inactive
    req.user.isActive = false;
    await req.user.save();
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

module.exports = router;