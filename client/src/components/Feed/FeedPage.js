import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { VideoLibrary } from '@mui/icons-material';

function FeedPage() {
  return (
    <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
          }}
        >
          <VideoLibrary sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Social Feed
          </Typography>
          <Typography variant="body1" color="text.secondary">
            YouTube Shorts and Instagram Reels will be displayed here.
            Feed content resets every 5 hours!
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default FeedPage;