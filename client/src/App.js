import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Box } from '@mui/material';

// Context providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Components
import LoginPage from './components/Auth/LoginPage';
import Dashboard from './components/Dashboard/Dashboard';
import ChatPage from './components/Chat/ChatPage';
import FeedPage from './components/Feed/FeedPage';
import ProfilePage from './components/Profile/ProfilePage';
import PaymentsPage from './components/Payments/PaymentsPage';
import SearchPage from './components/Search/SearchPage';
import LoadingScreen from './components/Common/LoadingScreen';
import SessionTimer from './components/Common/SessionTimer';
import BottomNavigation from './components/Navigation/BottomNavigation';

// Create enhanced theme with better responsive design
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#9bb0ff',
      dark: '#3f51b5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#a67cd6',
      dark: '#4a2c7a',
      contrastText: '#ffffff',
    },
    background: {
      default: 'transparent',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          '@media (max-width:600px)': {
            backgroundAttachment: 'scroll',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          padding: '8px 24px',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden',
        },
      },
    },
  },
});

// Create query client with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Protected Route component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route component (redirect to dashboard if authenticated)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Enhanced App Layout with responsive design
function AppLayout({ children }) {
  const { user } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundAttachment: { xs: 'scroll', md: 'fixed' },
      }}
    >
      {user && <SessionTimer />}
      
      <Box
        component="main"
        sx={{
          flex: 1,
          pb: user ? { xs: 8, sm: 0 } : 0, // Add padding for bottom nav on mobile
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
      
      {user && (
        <Box
          sx={{
            display: { xs: 'block', sm: 'block' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <BottomNavigation />
        </Box>
      )}
    </Box>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <AuthProvider>
            <SocketProvider>
              <Router>
                <AppLayout>
                  <Routes>
                    {/* Public Routes */}
                    <Route 
                      path="/login" 
                      element={
                        <PublicRoute>
                          <LoginPage />
                        </PublicRoute>
                      } 
                    />
                    
                    {/* Protected Routes */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/chat" 
                      element={
                        <ProtectedRoute>
                          <ChatPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/chat/:userId" 
                      element={
                        <ProtectedRoute>
                          <ChatPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/feed" 
                      element={
                        <ProtectedRoute>
                          <FeedPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/profile/:userId" 
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/payments" 
                      element={
                        <ProtectedRoute>
                          <PaymentsPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/search" 
                      element={
                        <ProtectedRoute>
                          <SearchPage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* 404 redirect */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </AppLayout>
              </Router>
            </SocketProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;