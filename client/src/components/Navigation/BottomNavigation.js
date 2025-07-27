import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BottomNavigation as MuiBottomNavigation, 
  BottomNavigationAction,
  Paper,
  Badge,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard,
  Chat,
  VideoLibrary,
  AccountCircle,
  Payment,
  Search
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { messagesAPI } from '../../utils/api';

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get unread message count
  const { data: unreadData } = useQuery(
    'unread-count',
    messagesAPI.getUnreadCount,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      retry: 1,
    }
  );

  const unreadCount = unreadData?.data?.unreadCount || 0;

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 0;
    if (path.startsWith('/chat')) return 1;
    if (path.startsWith('/feed')) return 2;
    if (path.startsWith('/search')) return 3;
    if (path.startsWith('/payments')) return 4;
    if (path.startsWith('/profile')) return 5;
    return 0;
  };

  const handleChange = (event, newValue) => {
    const routes = [
      '/dashboard',
      '/chat',
      '/feed',
      '/search',
      '/payments',
      '/profile'
    ];
    navigate(routes[newValue]);
  };

  const navigationItems = [
    {
      label: 'Home',
      icon: <Dashboard />,
      value: 0,
    },
    {
      label: 'Chat',
      icon: unreadCount > 0 ? (
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Chat />
        </Badge>
      ) : <Chat />,
      value: 1,
    },
    {
      label: 'Feed',
      icon: <VideoLibrary />,
      value: 2,
    },
    {
      label: 'Search',
      icon: <Search />,
      value: 3,
    },
    {
      label: 'Pay',
      icon: <Payment />,
      value: 4,
    },
    {
      label: 'Profile',
      icon: <AccountCircle />,
      value: 5,
    },
  ];

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent)',
        },
      }}
    >
      {/* Active indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: `${(getCurrentTab() / 6) * 100}%`,
          width: `${100 / 6}%`,
          height: '3px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '0 0 3px 3px',
        }}
      />
      
      <MuiBottomNavigation
        value={getCurrentTab()}
        onChange={handleChange}
        showLabels={isMobile}
        sx={{
          background: 'transparent',
          height: isMobile ? 64 : 56,
          '& .MuiBottomNavigationAction-root': {
            color: 'rgba(0, 0, 0, 0.6)',
            transition: 'all 0.2s ease',
            borderRadius: '12px',
            margin: '4px 2px',
            minWidth: isMobile ? 'auto' : 64,
            '&:hover': {
              background: 'rgba(102, 126, 234, 0.08)',
              transform: 'translateY(-2px)',
              color: theme.palette.primary.main,
            },
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              background: 'rgba(102, 126, 234, 0.12)',
              transform: 'translateY(-1px)',
              '& .MuiBottomNavigationAction-label': {
                fontSize: isMobile ? '0.75rem' : '0.7rem',
                fontWeight: 600,
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: isMobile ? '0.7rem' : '0.65rem',
              fontWeight: 500,
              marginTop: isMobile ? 4 : 2,
              transition: 'all 0.2s ease',
            },
            '& .MuiSvgIcon-root': {
              fontSize: isMobile ? '1.5rem' : '1.3rem',
              transition: 'all 0.2s ease',
            },
          },
        }}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            icon={item.icon}
            sx={{
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          />
        ))}
      </MuiBottomNavigation>
    </Paper>
  );
}

export default BottomNavigation;