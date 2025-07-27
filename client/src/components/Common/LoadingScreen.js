import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

function LoadingScreen({ message = 'Loading...' }) {
  return (
    <Box
      className="full-height flex-center gradient-bg"
      sx={{
        flexDirection: 'column',
        color: 'white',
      }}
    >
      <CircularProgress 
        size={60} 
        sx={{ 
          color: 'white',
          mb: 3
        }} 
      />
      <Typography variant="h6" sx={{ opacity: 0.9 }}>
        {message}
      </Typography>
    </Box>
  );
}

export default LoadingScreen;