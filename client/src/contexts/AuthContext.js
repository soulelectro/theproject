import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, handleAPIError } from '../utils/api';
import { useNotification } from './NotificationContext';

// Initial state
const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  UPDATE_SESSION: 'UPDATE_SESSION',
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case ActionTypes.LOGOUT:
      return {
        ...initialState,
        loading: false,
      };
    
    case ActionTypes.UPDATE_SESSION:
      return {
        ...state,
        user: {
          ...state.user,
          sessionTimeRemaining: action.payload.sessionTimeRemaining,
          sessionEndTime: action.payload.sessionEndTime,
        },
      };
    
    default:
      return state;
  }
}

// Context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { showNotification } = useNotification();

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: ActionTypes.SET_USER,
          payload: { user: parsedUser, token },
        });
        
        // Verify token with server
        verifyToken();
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    } else {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // Verify token with server
  const verifyToken = async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data.user;
      
      dispatch({
        type: ActionTypes.SET_USER,
        payload: { user: userData, token: localStorage.getItem('token') },
      });
      
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  // Send OTP
  const sendOTP = async (phoneNumber) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.SET_ERROR, payload: null });
      
      const response = await authAPI.sendOTP(phoneNumber);
      
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      showNotification('OTP sent successfully!', 'success');
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorData = handleAPIError(error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: errorData.message });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      showNotification(errorData.message, 'error');
      
      return { success: false, error: errorData.message };
    }
  };

  // Verify OTP and login
  const verifyOTP = async (phoneNumber, otp, username = null) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.SET_ERROR, payload: null });
      
      const response = await authAPI.verifyOTP(phoneNumber, otp, username);
      const { token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: ActionTypes.SET_USER,
        payload: { user, token },
      });
      
      showNotification('Login successful!', 'success');
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorData = handleAPIError(error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: errorData.message });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      showNotification(errorData.message, 'error');
      
      return { success: false, error: errorData.message, data: errorData.data };
    }
  };

  // Extend session
  const extendSession = async () => {
    try {
      const response = await authAPI.extendSession();
      const { sessionTimeRemaining, sessionEndTime } = response.data;
      
      dispatch({
        type: ActionTypes.UPDATE_SESSION,
        payload: { sessionTimeRemaining, sessionEndTime },
      });
      
      // Update localStorage
      const updatedUser = {
        ...state.user,
        sessionTimeRemaining,
        sessionEndTime,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      showNotification('Session extended successfully!', 'success');
      
      return { success: true };
    } catch (error) {
      const errorData = handleAPIError(error);
      showNotification(errorData.message, 'error');
      
      return { success: false, error: errorData.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (state.token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear localStorage and state regardless of API call result
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: ActionTypes.LOGOUT });
      showNotification('Logged out successfully', 'info');
    }
  };

  // Update user profile
  const updateUser = (updatedUserData) => {
    const updatedUser = { ...state.user, ...updatedUserData };
    
    dispatch({
      type: ActionTypes.SET_USER,
      payload: { user: updatedUser, token: state.token },
    });
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Check if session is expiring soon
  const isSessionExpiringSoon = () => {
    if (!state.user?.sessionTimeRemaining) return false;
    
    const { hours, minutes } = state.user.sessionTimeRemaining;
    const totalMinutes = hours * 60 + minutes;
    
    return totalMinutes <= 30; // 30 minutes or less
  };

  // Check if session is critical (less than 10 minutes)
  const isSessionCritical = () => {
    if (!state.user?.sessionTimeRemaining) return false;
    
    const { hours, minutes } = state.user.sessionTimeRemaining;
    const totalMinutes = hours * 60 + minutes;
    
    return totalMinutes <= 10; // 10 minutes or less
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    
    // Actions
    sendOTP,
    verifyOTP,
    logout,
    extendSession,
    updateUser,
    
    // Utilities
    isSessionExpiringSoon,
    isSessionCritical,
    isAuthenticated: !!state.user && !!state.token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;