import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  sendOTP: (phoneNumber) => api.post('/auth/send-otp', { phoneNumber }),
  verifyOTP: (phoneNumber, otp, username) => api.post('/auth/verify-otp', { phoneNumber, otp, username }),
  getMe: () => api.get('/auth/me'),
  extendSession: () => api.post('/auth/extend-session'),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  searchUsers: (query, limit = 20) => api.get(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  getUserById: (userId) => api.get(`/users/${userId}`),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId, limit = 50) => api.get(`/users/${userId}/followers?limit=${limit}`),
  getFollowing: (userId, limit = 50) => api.get(`/users/${userId}/following?limit=${limit}`),
  getSuggestions: (limit = 10) => api.get(`/users/suggestions/follow?limit=${limit}`),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId, limit = 50) => api.get(`/messages/conversation/${userId}?limit=${limit}`),
  sendMessage: (recipientId, content, messageType = 'text', paymentData = null) => 
    api.post('/messages/send', { recipientId, content, messageType, paymentData }),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  getUnreadCount: () => api.get('/messages/unread-count'),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  getStats: () => api.get('/messages/stats'),
};

// Payments API
export const paymentsAPI = {
  createPayment: (recipientId, amount, description = '', paymentMethod = 'upi') =>
    api.post('/payments/create', { recipientId, amount, description, paymentMethod }),
  generateUPILink: (paymentId) => api.post('/payments/upi-link', { paymentId }),
  verifyPayment: (paymentId, razorpayPaymentId = null, razorpaySignature = null) =>
    api.post('/payments/verify', { paymentId, razorpayPaymentId, razorpaySignature }),
  getHistory: (limit = 50, status = null) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (status) params.append('status', status);
    return api.get(`/payments/history?${params}`);
  },
  getPending: () => api.get('/payments/pending'),
  cancelPayment: (paymentId) => api.put(`/payments/${paymentId}/cancel`),
  getStats: () => api.get('/payments/stats'),
};

// Feed API
export const feedAPI = {
  getYouTubeShorts: (limit = 20, region = 'IN') => 
    api.get(`/feed/youtube-shorts?limit=${limit}&region=${region}`),
  getInstagramReels: (limit = 20) => api.get(`/feed/instagram-reels?limit=${limit}`),
  getMixedFeed: (limit = 20) => api.get(`/feed/mixed?limit=${limit}`),
  clearCache: () => api.delete('/feed/cache'),
  getTrendingHashtags: () => api.get('/feed/trending-hashtags'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

// Utility functions
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.error || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      data: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
      data: null,
    };
  }
};

export const formatAPIResponse = (response) => {
  return {
    data: response.data,
    status: response.status,
    message: response.data?.message || 'Success',
  };
};

// File upload utility
export const uploadFile = async (file, endpoint = '/upload') => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Export the configured axios instance as default
export default api;