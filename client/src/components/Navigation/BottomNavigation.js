import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BottomNavigation as MuiBottomNavigation, 
  BottomNavigationAction,
  Paper,
  Badge
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
  
  // Get unread message count
  const { data: unreadData } = useQuery(
    'unread-count',
    messagesAPI.getUnreadCount,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
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

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
      }}
      elevation={3}
    >
      <MuiBottomNavigation
        value={getCurrentTab()}
        onChange={handleChange}
        showLabels
        sx={{
          background: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: 'rgba(0, 0, 0, 0.6)',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        <BottomNavigationAction
          label="Home"
          icon={<Dashboard />}
        />
        
        <BottomNavigationAction
          label="Chat"
          icon={
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <Chat />
            </Badge>
          }
        />
        
        <BottomNavigationAction
          label="Feed"
          icon={<VideoLibrary />}
        />
        
        <BottomNavigationAction
          label="Search"
          icon={<Search />}
        />
        
        <BottomNavigationAction
          label="Pay"
          icon={<Payment />}
        />
        
        <BottomNavigationAction
          label="Profile"
          icon={<AccountCircle />}
        />
      </MuiBottomNavigation>
    </Paper>
  );
}

export default BottomNavigation;