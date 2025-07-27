import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Search } from '@mui/icons-material';

function SearchPage() {
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
          <Search sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Search & Discovery
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Find friends by phone number or username.
            Connect across social platforms in temporary sessions!
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default SearchPage;