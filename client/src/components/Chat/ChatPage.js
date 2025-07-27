import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Chat } from '@mui/icons-material';

function ChatPage() {
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
          <Chat sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Chat Page
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ephemeral messaging functionality will be implemented here.
            Messages disappear after 5 hours!
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default ChatPage;