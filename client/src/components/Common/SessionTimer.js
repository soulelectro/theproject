import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { AccessTime, Warning } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

function SessionTimer() {
  const { user, extendSession, isSessionExpiringSoon, isSessionCritical } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showExtendDialog, setShowExtendDialog] = useState(false);

  useEffect(() => {
    if (!user?.sessionTimeRemaining) return;

    const updateTimer = () => {
      // Calculate current time remaining
      const sessionEnd = new Date(user.sessionEndTime);
      const now = new Date();
      const remaining = sessionEnd - now;

      if (remaining <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds, expired: false });
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [user?.sessionEndTime]);

  const handleExtendSession = async () => {
    const result = await extendSession();
    if (result.success) {
      setShowExtendDialog(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return '0:00:00';
    
    const { hours, minutes, seconds } = time;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (isSessionCritical()) return 'session-timer critical';
    if (isSessionExpiringSoon()) return 'session-timer warning';
    return 'session-timer';
  };

  if (!timeRemaining || timeRemaining.expired) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
        }}
      >
        <Box
          className={getTimerClass()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: isSessionExpiringSoon() ? 'pointer' : 'default',
          }}
          onClick={() => isSessionExpiringSoon() && setShowExtendDialog(true)}
        >
          {isSessionCritical() ? (
            <Warning fontSize="small" />
          ) : (
            <AccessTime fontSize="small" />
          )}
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatTime(timeRemaining)}
          </Typography>
        </Box>
      </Box>

      <Dialog
        open={showExtendDialog}
        onClose={() => setShowExtendDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Session Expiring Soon
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Your session will expire in {formatTime(timeRemaining)}. 
            Would you like to extend your session for another 5 hours?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExtendDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExtendSession} 
            variant="contained"
            color="primary"
          >
            Extend Session
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SessionTimer;