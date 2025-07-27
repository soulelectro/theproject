import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Create socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || '', {
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        // Join user room
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      // Handle session expiry
      newSocket.on('sessionExpired', () => {
        showNotification('Your session has expired. Please login again.', 'warning');
        // The auth context will handle logout
      });

      // Handle session warnings
      newSocket.on('sessionWarning', (data) => {
        showNotification(data.message, 'warning');
      });

      // Handle new messages
      newSocket.on('newMessage', (message) => {
        // This will be handled by individual components
        console.log('New message received:', message);
      });

      // Handle message read receipts
      newSocket.on('messageRead', (data) => {
        console.log('Message read:', data);
      });

      // Handle typing indicators
      newSocket.on('userTyping', (data) => {
        console.log('User typing:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    } else {
      // Clean up socket if user is not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  // Socket utility functions
  const sendMessage = (recipientId, content, messageType = 'text', paymentData = null) => {
    if (socket && connected) {
      socket.emit('sendMessage', {
        recipientId,
        content,
        messageType,
        paymentData,
      });
    }
  };

  const markMessageAsRead = (messageId) => {
    if (socket && connected) {
      socket.emit('markMessageRead', messageId);
    }
  };

  const sendTypingIndicator = (recipientId, isTyping) => {
    if (socket && connected) {
      socket.emit('typing', { recipientId, isTyping });
    }
  };

  const joinRoom = (roomId) => {
    if (socket && connected) {
      socket.emit('joinRoom', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && connected) {
      socket.emit('leaveRoom', roomId);
    }
  };

  const value = {
    socket,
    connected,
    sendMessage,
    markMessageAsRead,
    sendTypingIndicator,
    joinRoom,
    leaveRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;