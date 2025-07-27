const express = require('express');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay (fallback to mock if not configured)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Create payment request
router.post('/create', auth, async (req, res) => {
  try {
    const { recipientId, amount, description = '', paymentMethod = 'upi' } = req.body;
    const sender = req.user;

    if (!recipientId || !amount) {
      return res.status(400).json({ error: 'Recipient ID and amount are required' });
    }

    if (amount < 1 || amount > 100000) {
      return res.status(400).json({ error: 'Amount must be between ₹1 and ₹1,00,000' });
    }

    if (!sender.upiId) {
      return res.status(400).json({ error: 'Please add your UPI ID in profile first' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    if (!recipient.upiId) {
      return res.status(400).json({ error: 'Recipient has not added UPI ID' });
    }

    if (recipientId === sender._id.toString()) {
      return res.status(400).json({ error: 'Cannot send payment to yourself' });
    }

    const transactionId = `TXN_${uuidv4().replace(/-/g, '').toUpperCase().slice(0, 16)}`;

    // Create payment record
    const payment = new Payment({
      sender: sender._id,
      recipient: recipientId,
      amount,
      description,
      paymentMethod,
      senderUpiId: sender.upiId,
      recipientUpiId: recipient.upiId,
      transactionId,
      metadata: {
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    // Create Razorpay order if configured
    if (razorpay) {
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: amount * 100, // Convert to paise
          currency: 'INR',
          receipt: transactionId,
          payment_capture: 1,
          notes: {
            sender_upi: sender.upiId,
            recipient_upi: recipient.upiId,
            description: description
          }
        });

        payment.razorpayOrderId = razorpayOrder.id;
      } catch (razorpayError) {
        console.error('Razorpay order creation error:', razorpayError);
        // Continue without Razorpay in development
        if (process.env.NODE_ENV !== 'development') {
          return res.status(500).json({ error: 'Failed to create payment order' });
        }
      }
    }

    await payment.save();

    // Create payment request message
    const paymentMessage = new Message({
      sender: sender._id,
      recipient: recipientId,
      content: `Payment request for ₹${amount}${description ? `: ${description}` : ''}`,
      messageType: 'payment_request',
      paymentData: {
        amount,
        upiId: recipient.upiId,
        transactionId,
        status: 'pending'
      }
    });

    await paymentMessage.save();

    res.json({
      message: 'Payment request created successfully',
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        description: payment.description,
        recipientUpiId: payment.recipientUpiId,
        razorpayOrderId: payment.razorpayOrderId,
        status: payment.status,
        createdAt: payment.createdAt
      }
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment request' });
  }
});

// Generate UPI payment link
router.post('/upi-link', auth, async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const payment = await Payment.findById(paymentId)
      .populate('sender', 'username')
      .populate('recipient', 'username');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.sender._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access to payment' });
    }

    // Generate UPI payment URL
    const upiUrl = `upi://pay?pa=${payment.recipientUpiId}&pn=${payment.recipient.username}&am=${payment.amount}&cu=INR&tn=${encodeURIComponent(payment.description || 'Payment from Temporary Social App')}&tr=${payment.transactionId}`;

    // Generate QR code data (for frontend to create QR code)
    const qrCodeData = {
      upiUrl,
      amount: payment.amount,
      recipientName: payment.recipient.username,
      recipientUpi: payment.recipientUpiId,
      transactionId: payment.transactionId,
      description: payment.description
    };

    // Update payment with QR code data
    payment.qrCodeData = JSON.stringify(qrCodeData);
    await payment.save();

    res.json({
      message: 'UPI payment link generated successfully',
      upiUrl,
      qrCodeData,
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        recipient: payment.recipient.username,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('Generate UPI link error:', error);
    res.status(500).json({ error: 'Failed to generate UPI payment link' });
  }
});

// Verify payment (webhook or manual verification)
router.post('/verify', auth, async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const payment = await Payment.findById(paymentId)
      .populate('sender', 'username')
      .populate('recipient', 'username');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // In development mode, allow manual verification
    if (process.env.NODE_ENV === 'development') {
      await payment.markCompleted(razorpayPaymentId);

      // Create confirmation message
      const confirmationMessage = new Message({
        sender: payment.recipient._id,
        recipient: payment.sender._id,
        content: `Payment of ₹${payment.amount} received successfully!`,
        messageType: 'payment_confirmation',
        paymentData: {
          amount: payment.amount,
          transactionId: payment.transactionId,
          status: 'completed'
        }
      });

      await confirmationMessage.save();

      res.json({
        message: 'Payment verified successfully',
        payment: {
          id: payment._id,
          transactionId: payment.transactionId,
          status: payment.status,
          completedAt: payment.completedAt
        }
      });
    } else {
      // Production: Verify with Razorpay
      if (!razorpay || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ error: 'Invalid payment verification data' });
      }

      // Verify Razorpay signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${payment.razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature === razorpaySignature) {
        await payment.markCompleted(razorpayPaymentId);

        // Create confirmation message
        const confirmationMessage = new Message({
          sender: payment.recipient._id,
          recipient: payment.sender._id,
          content: `Payment of ₹${payment.amount} received successfully!`,
          messageType: 'payment_confirmation',
          paymentData: {
            amount: payment.amount,
            transactionId: payment.transactionId,
            status: 'completed'
          }
        });

        await confirmationMessage.save();

        res.json({
          message: 'Payment verified successfully',
          payment: {
            id: payment._id,
            transactionId: payment.transactionId,
            status: payment.status,
            completedAt: payment.completedAt
          }
        });
      } else {
        await payment.markFailed('Invalid signature verification');
        res.status(400).json({ error: 'Payment verification failed' });
      }
    }

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 50, status } = req.query;
    const userId = req.user._id;

    let filter = {
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    };

    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate('sender', 'username profilePicture')
      .populate('recipient', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const paymentsWithDirection = payments.map(payment => ({
      id: payment._id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      description: payment.description,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      direction: payment.sender._id.toString() === userId.toString() ? 'sent' : 'received',
      otherUser: payment.sender._id.toString() === userId.toString() ? 
        payment.recipient : payment.sender,
      failureReason: payment.failureReason
    }));

    res.json({ payments: paymentsWithDirection });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

// Get pending payments
router.get('/pending', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const pendingPayments = await Payment.getPendingPayments(userId);

    const paymentsWithDirection = pendingPayments.map(payment => ({
      id: payment._id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      description: payment.description,
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt,
      direction: payment.sender._id.toString() === userId.toString() ? 'sent' : 'received',
      otherUser: payment.sender._id.toString() === userId.toString() ? 
        payment.recipient : payment.sender,
      upiUrl: payment.qrCodeData ? JSON.parse(payment.qrCodeData).upiUrl : null
    }));

    res.json({ pendingPayments: paymentsWithDirection });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({ error: 'Failed to get pending payments' });
  }
});

// Cancel payment
router.put('/:paymentId/cancel', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to cancel this payment' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel non-pending payment' });
    }

    payment.status = 'cancelled';
    await payment.save();

    res.json({
      message: 'Payment cancelled successfully',
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({ error: 'Failed to cancel payment' });
  }
});

// Get payment statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Payment.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmountSent: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$sender', userId] }, { $eq: ['$status', 'completed'] }] },
                '$amount',
                0
              ]
            }
          },
          totalAmountReceived: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$recipient', userId] }, { $eq: ['$status', 'completed'] }] },
                '$amount',
                0
              ]
            }
          },
          pendingPayments: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          completedPayments: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          failedPayments: {
            $sum: {
              $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalPayments: 0,
      totalAmountSent: 0,
      totalAmountReceived: 0,
      pendingPayments: 0,
      completedPayments: 0,
      failedPayments: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ error: 'Failed to get payment statistics' });
  }
});

module.exports = router;