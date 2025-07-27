const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Message = require('./models/Message');
const Payment = require('./models/Payment');
const OTP = require('./models/OTP');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const paymentRoutes = require('./routes/payments');
const feedRoutes = require('./routes/feed');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/temporary-social-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { recipientId, content, messageType = 'text', paymentData = null } = data;
      
      const message = new Message({
        sender: socket.userId,
        recipient: recipientId,
        content,
        messageType,
        paymentData
      });

      await message.save();
      await message.populate('sender', 'username profilePicture');
      await message.populate('recipient', 'username profilePicture');

      // Send to recipient if online
      const recipientSocketId = connectedUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', message);
      }

      // Send confirmation to sender
      socket.emit('messageSent', message);
    } catch (error) {
      socket.emit('messageError', { error: error.message });
    }
  });

  socket.on('markMessageRead', async (messageId) => {
    try {
      const message = await Message.findById(messageId);
      if (message && message.recipient.toString() === socket.userId) {
        await message.markAsRead();
        
        // Notify sender if online
        const senderSocketId = connectedUsers.get(message.sender.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageRead', { messageId, readAt: message.readAt });
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  socket.on('typing', (data) => {
    const { recipientId, isTyping } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('userTyping', {
        userId: socket.userId,
        isTyping
      });
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feed', feedRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connectedUsers: connectedUsers.size
  });
});

// Cleanup job - runs every hour to clean expired sessions
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running cleanup job...');
    
    // Clean expired users (MongoDB TTL should handle this, but let's be sure)
    const expiredUsers = await User.find({ sessionEndTime: { $lt: new Date() } });
    for (const user of expiredUsers) {
      // Disconnect user if online
      const socketId = connectedUsers.get(user._id.toString());
      if (socketId) {
        io.to(socketId).emit('sessionExpired');
        connectedUsers.delete(user._id.toString());
      }
    }
    
    console.log(`Cleanup completed. Removed ${expiredUsers.length} expired users.`);
  } catch (error) {
    console.error('Cleanup job error:', error);
  }
});

// Session check job - runs every 5 minutes to notify users about session expiry
cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    // Find users whose sessions expire in the next 30 minutes
    const usersNearExpiry = await User.find({
      sessionEndTime: { $gte: now, $lte: thirtyMinutesFromNow },
      isActive: true
    });
    
    for (const user of usersNearExpiry) {
      const socketId = connectedUsers.get(user._id.toString());
      if (socketId) {
        const timeRemaining = user.sessionTimeRemaining;
        io.to(socketId).emit('sessionWarning', {
          timeRemaining,
          message: `Your session expires in ${timeRemaining.hours}h ${timeRemaining.minutes}m`
        });
      }
    }
  } catch (error) {
    console.error('Session check job error:', error);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});