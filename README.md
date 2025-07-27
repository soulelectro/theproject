# 🧠 Temporary Social - Ephemeral Social Networking App

A temporary social networking application where users log in using mobile OTP, messages and sessions vanish after 5 hours, and users can send UPI payments while enjoying real-time social feeds.

## ✨ Features

### 🔐 Authentication System
- **OTP-based Login**: Secure phone number verification using Twilio
- **5-Hour Sessions**: Automatic session expiry after 5 hours
- **Session Management**: Real-time session timer with extension option

### 💬 Ephemeral Messaging
- **Text Messages Only**: Simple, focused messaging experience
- **Auto-Expiry**: All messages disappear after 5 hours
- **Real-time Chat**: Socket.io powered instant messaging
- **1:1 Conversations**: Private messaging between users

### 💳 UPI Payment System
- **Send/Receive Money**: Integrated UPI payment system
- **Razorpay Integration**: Secure payment processing
- **QR Code Generation**: Dynamic QR codes for payments
- **Payment History**: Track all transactions (expires in 5 hours)

### 📱 Social Media Feed
- **YouTube Shorts**: Trending short videos integration
- **Instagram Reels**: Social media content feed
- **Mixed Feed**: Combined content from multiple platforms
- **Feed Reset**: Content refreshes every 5 hours

### 👥 Friend Discovery
- **Search Users**: Find friends by phone number or username
- **Cross-Platform Links**: Connect Instagram, Discord, Reddit, etc.
- **Follow System**: Temporary following relationships
- **User Suggestions**: Discover new people to follow

### 👤 User Profiles
- **Temporary Profiles**: All data expires after 5 hours
- **Social Links**: Connect multiple social media accounts
- **UPI Integration**: Add UPI ID for payments
- **Session Status**: Real-time session information

## 🏗️ Architecture

### Backend (Node.js/Express)
- **RESTful API**: Clean API design with proper error handling
- **Socket.io**: Real-time messaging and notifications
- **MongoDB**: Database with TTL (Time-To-Live) indexes
- **JWT Authentication**: Secure token-based auth
- **Scheduled Jobs**: Automatic cleanup of expired data

### Frontend (React)
- **Material-UI**: Beautiful, responsive design
- **React Query**: Efficient data fetching and caching
- **Context API**: Global state management
- **Socket.io Client**: Real-time updates
- **Progressive Web App**: Mobile-first design

### Database Schema
```javascript
// Users - Auto-expires after 5 hours
{
  phoneNumber: String,
  username: String,
  sessionStartTime: Date,
  sessionEndTime: Date, // TTL index
  upiId: String,
  socialLinks: Object,
  followers: [ObjectId],
  following: [ObjectId]
}

// Messages - Auto-expires after 5 hours
{
  sender: ObjectId,
  recipient: ObjectId,
  content: String,
  messageType: String,
  expiresAt: Date, // TTL index
  paymentData: Object
}

// Payments - Auto-expires after 5 hours
{
  sender: ObjectId,
  recipient: ObjectId,
  amount: Number,
  transactionId: String,
  status: String,
  expiresAt: Date // TTL index
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud)
- Twilio Account (for SMS OTP)
- Razorpay Account (for payments)
- YouTube API Key (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd temporary-social-app
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Set up environment variables**

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/temporary-social-app
JWT_SECRET=your-super-secret-jwt-key-here
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
YOUTUBE_API_KEY=your-youtube-api-key
NODE_ENV=development
```

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

4. **Start the application**
```bash
# Development mode (both server and client)
npm run dev

# Or start separately
npm run server  # Backend only
npm run client  # Frontend only
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 📱 Usage Guide

### Getting Started
1. **Register/Login**: Enter your phone number
2. **Verify OTP**: Check your SMS for the verification code
3. **Create Username**: Choose a unique username (for new users)
4. **Start Session**: You now have 5 hours to use the app!

### Core Features
- **Dashboard**: View your activity and quick actions
- **Chat**: Send messages that disappear after 5 hours
- **Feed**: Watch YouTube Shorts and Instagram Reels
- **Search**: Find and follow other users
- **Payments**: Send/receive money via UPI
- **Profile**: Manage your temporary profile and social links

### Session Management
- **Timer**: Always visible session countdown
- **Warnings**: Notifications when session expires soon
- **Extension**: Extend session for another 5 hours
- **Auto-Logout**: Automatic logout when session expires

## 🔧 Configuration

### Development Mode
- **Mock Data**: Uses mock data when APIs aren't configured
- **Console OTP**: OTP displayed in console for testing
- **Hot Reload**: Automatic restart on code changes

### Production Deployment
1. **Build the client**
```bash
cd client && npm run build
```

2. **Set production environment variables**
3. **Start the server**
```bash
npm start
```

### API Integration

#### Twilio SMS Setup
1. Create Twilio account
2. Get Account SID and Auth Token
3. Purchase a phone number
4. Add credentials to `.env`

#### Razorpay Payment Setup
1. Create Razorpay account
2. Get API keys from dashboard
3. Add credentials to `.env`
4. Configure webhooks for payment verification

#### YouTube API Setup
1. Create Google Cloud Project
2. Enable YouTube Data API v3
3. Generate API key
4. Add to `.env`

## 🛡️ Security Features

- **JWT Tokens**: Secure authentication with expiry
- **Phone Verification**: OTP-based identity confirmation
- **Session Limits**: Automatic 5-hour session expiry
- **Data Encryption**: Secure data transmission
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting for security

## 🔄 Data Lifecycle

### Automatic Cleanup
- **MongoDB TTL**: Database-level automatic expiry
- **Cron Jobs**: Scheduled cleanup tasks
- **Session Management**: Real-time session monitoring
- **Socket Cleanup**: Automatic disconnection of expired users

### Data Retention
- **Messages**: 5 hours from creation
- **User Sessions**: 5 hours from login
- **Payments**: 5 hours from transaction
- **Feed Cache**: 30 minutes (refreshes automatically)

## 🎨 UI/UX Features

- **Material Design 3**: Modern, beautiful interface
- **Responsive Design**: Works on all device sizes
- **Dark Mode Support**: System preference detection
- **Progressive Web App**: Install as mobile app
- **Offline Support**: Basic offline functionality
- **Real-time Updates**: Live notifications and updates

## 🧪 Testing

### Development Testing
```bash
# Run server tests
cd server && npm test

# Run client tests
cd client && npm test
```

### Manual Testing
1. **Authentication Flow**: Test OTP login
2. **Messaging**: Send/receive messages
3. **Payments**: Test UPI transactions
4. **Session Expiry**: Wait for 5-hour expiry
5. **Real-time Features**: Test Socket.io functionality

## 🚀 Deployment Options

### Heroku Deployment
1. Create Heroku app
2. Set environment variables
3. Deploy using Git
4. Configure MongoDB Atlas

### Docker Deployment
```dockerfile
# Dockerfile included for containerization
docker build -t temporary-social .
docker run -p 5000:5000 temporary-social
```

### Cloud Deployment
- **Frontend**: Vercel, Netlify
- **Backend**: Heroku, Railway, DigitalOcean
- **Database**: MongoDB Atlas
- **Storage**: AWS S3 (for file uploads)

## 📊 Monitoring & Analytics

### Health Checks
- **API Health**: `/api/health` endpoint
- **Database Connection**: MongoDB connection status
- **Socket Status**: Real-time connection monitoring

### Logging
- **Request Logging**: All API requests logged
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Material-UI**: Beautiful React components
- **Socket.io**: Real-time communication
- **Twilio**: SMS/OTP services
- **Razorpay**: Payment processing
- **MongoDB**: Database with TTL support
- **React Query**: Data fetching and caching

## 📞 Support

For support, email support@temporarysocial.app or create an issue in the repository.

---

**Built with ❤️ for ephemeral social connections**