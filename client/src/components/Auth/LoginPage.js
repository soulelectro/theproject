import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Step,
  Stepper,
  StepLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import { Phone, Security, Person } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const steps = ['Phone Number', 'Verify OTP', 'Complete Profile'];

function LoginPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState({});
  const [otpData, setOtpData] = useState(null);
  
  const { sendOTP, verifyOTP, loading, error } = useAuth();

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOTP = async () => {
    setErrors({});
    
    if (!phoneNumber) {
      setErrors({ phoneNumber: 'Phone number is required' });
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      setErrors({ phoneNumber: 'Please enter a valid phone number' });
      return;
    }

    const result = await sendOTP(phoneNumber);
    
    if (result.success) {
      setOtpData(result.data);
      setActiveStep(1);
    }
  };

  const handleVerifyOTP = async () => {
    setErrors({});
    
    if (!otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }
    
    if (otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return;
    }

    const result = await verifyOTP(phoneNumber, otp, username);
    
    if (!result.success && result.data?.newUser) {
      // New user needs to provide username
      setActiveStep(2);
    } else if (result.success) {
      // Login successful - AuthContext will handle redirect
    }
  };

  const handleCompleteProfile = async () => {
    setErrors({});
    
    if (!username) {
      setErrors({ username: 'Username is required' });
      return;
    }
    
    if (username.length < 3) {
      setErrors({ username: 'Username must be at least 3 characters' });
      return;
    }

    const result = await verifyOTP(phoneNumber, otp, username);
    
    if (result.success) {
      // Registration successful - AuthContext will handle redirect
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone /> Enter Your Phone Number
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We'll send you a verification code to confirm your identity
            </Typography>
            
            <TextField
              fullWidth
              label="Phone Number"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              sx={{ mb: 3 }}
            />
            
            <Button
              fullWidth
              variant="contained"
              onClick={handleSendOTP}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security /> Verify OTP
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the 6-digit code sent to {phoneNumber}
            </Typography>
            
            {process.env.NODE_ENV === 'development' && otpData?.otp && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Development Mode - OTP: {otpData.otp}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="OTP Code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={!!errors.otp}
              helperText={errors.otp}
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 6 }}
            />
            
            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyOTP}
              disabled={loading}
              sx={{ py: 1.5, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => setActiveStep(0)}
              disabled={loading}
            >
              Change Phone Number
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person /> Choose Username
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Pick a unique username for your temporary profile
            </Typography>
            
            <TextField
              fullWidth
              label="Username"
              placeholder="cooluser123"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              error={!!errors.username}
              helperText={errors.username || 'Only lowercase letters, numbers, and underscores allowed'}
              sx={{ mb: 3 }}
            />
            
            <Button
              fullWidth
              variant="contained"
              onClick={handleCompleteProfile}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Complete Registration'}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box className="full-height flex-center gradient-bg">
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
          className="fade-in"
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              🧠 Temporary Social
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              5-Hour Ephemeral Sessions
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {getStepContent(activeStep)}

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              By continuing, you agree to our Terms of Service
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;