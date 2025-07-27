const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get conversations list
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all conversations for the user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            id: '$user._id',
            username: '$user.username',
            profilePicture: '$user.profilePicture'
          },
          lastMessage: {
            id: '$lastMessage._id',
            content: '$lastMessage.content',
            messageType: '$lastMessage.messageType',
            createdAt: '$lastMessage.createdAt',
            isRead: '$lastMessage.isRead',
            sender: '$lastMessage.sender'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get conversation with a specific user
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, page = 1 } = req.query;
    const currentUserId = req.user._id;

    // Check if the other user exists
    const otherUser = await User.findById(userId).select('username profilePicture');
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get messages between users
    const messages = await Message.getConversation(currentUserId, userId, parseInt(limit));

    // Mark messages as read if they are sent to current user
    await Message.updateMany(
      {
        sender: userId,
        recipient: currentUserId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      otherUser: {
        id: otherUser._id,
        username: otherUser.username,
        profilePicture: otherUser.profilePicture
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const { recipientId, content, messageType = 'text', paymentData = null } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !content) {
      return res.status(400).json({ error: 'Recipient ID and content are required' });
    }

    if (recipientId === senderId.toString()) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Create message
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content,
      messageType,
      paymentData
    });

    await message.save();
    await message.populate('sender', 'username profilePicture');
    await message.populate('recipient', 'username profilePicture');

    res.json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      recipient: userId
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.isRead) {
      return res.status(400).json({ error: 'Message already read' });
    }

    await message.markAsRead();

    res.json({
      message: 'Message marked as read',
      readAt: message.readAt
    });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Message.getUnreadCount(userId);

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Delete message (only sender can delete)
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Get message statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Message.aggregate([
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
          totalMessages: { $sum: 1 },
          sentMessages: {
            $sum: {
              $cond: [{ $eq: ['$sender', userId] }, 1, 0]
            }
          },
          receivedMessages: {
            $sum: {
              $cond: [{ $eq: ['$recipient', userId] }, 1, 0]
            }
          },
          unreadMessages: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalMessages: 0,
      sentMessages: 0,
      receivedMessages: 0,
      unreadMessages: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({ error: 'Failed to get message statistics' });
  }
});

module.exports = router;