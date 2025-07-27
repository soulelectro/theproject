import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import {
  Chat,
  Payment,
  VideoLibrary,
  Search,
  AccountCircle,
  Logout,
  AccessTime,
  People,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import { messagesAPI, paymentsAPI, usersAPI } from '../../utils/api';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Fetch dashboard data
  const { data: messageStats } = useQuery('message-stats', messagesAPI.getStats);
  const { data: paymentStats } = useQuery('payment-stats', paymentsAPI.getStats);
  const { data: suggestions } = useQuery('user-suggestions', () => usersAPI.getSuggestions(5));

  const handleLogout = async () => {
    await logout();
  };

  const formatTime = (timeRemaining) => {
    if (!timeRemaining) return '0:00:00';
    const { hours, minutes, seconds } = timeRemaining;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const quickActions = [
    {
      title: 'Start Chat',
      icon: <Chat />,
      color: '#2196F3',
      action: () => navigate('/chat'),
    },
    {
      title: 'Send Money',
      icon: <Payment />,
      color: '#4CAF50',
      action: () => navigate('/payments'),
    },
    {
      title: 'Watch Feed',
      icon: <VideoLibrary />,
      color: '#FF9800',
      action: () => navigate('/feed'),
    },
    {
      title: 'Find Friends',
      icon: <Search />,
      color: '#9C27B0',
      action: () => navigate('/search'),
    },
  ];

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{ 
                  width: 60, 
                  height: 60,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Welcome, {user?.username}!
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Session ends in {formatTime(user?.sessionTimeRemaining)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              <IconButton onClick={() => navigate('/profile')} sx={{ mr: 1 }}>
                <AccountCircle />
              </IconButton>
              <IconButton onClick={handleLogout} color="error">
                <Logout />
              </IconButton>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                      background: action.color,
                      color: 'white',
                    }}
                    onClick={action.action}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      {React.cloneElement(action.icon, { sx: { fontSize: 40, mb: 1 } })}
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {action.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Stats */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
              Your Activity
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Chat color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {messageStats?.data?.totalMessages || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Messages
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Payment color="success" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    ₹{paymentStats?.data?.totalAmountSent || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sent
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <People color="secondary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {user?.followingCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Following
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Suggested Users */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
              People to Follow
            </Typography>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              {suggestions?.data?.suggestions?.length > 0 ? (
                <Box>
                  {suggestions.data.suggestions.slice(0, 3).map((suggestedUser) => (
                    <Box
                      key={suggestedUser.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1,
                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {suggestedUser.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {suggestedUser.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {suggestedUser.followersCount} followers
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/profile/${suggestedUser.id}`)}
                      >
                        View
                      </Button>
                    </Box>
                  ))}
                  <Button
                    fullWidth
                    variant="text"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/search')}
                  >
                    Find More People
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <People sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No suggestions available
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/search')}
                  >
                    Search People
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* App Info */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  🧠 Temporary Social Experience
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                  Connect, chat, and pay in 5-hour ephemeral sessions
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="Ephemeral Messages" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                  <Chip label="UPI Payments" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                  <Chip label="Real-time Feed" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                  <Chip label="Social Discovery" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Dashboard;