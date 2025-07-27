package com.temporarysocial.app.presentation.screen.auth

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    viewModel: LoginViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF667EEA),
                        Color(0xFF764BA2)
                    )
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // App Logo and Title
            Text(
                text = "🧠",
                fontSize = 80.sp,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            Text(
                text = "Temporary Social",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                textAlign = TextAlign.Center
            )
            
            Text(
                text = "5-Hour Ephemeral Sessions",
                fontSize = 16.sp,
                color = Color.White.copy(alpha = 0.8f),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(bottom = 48.dp)
            )
            
            // Login Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color.White.copy(alpha = 0.95f)
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Step Indicator
                    StepIndicator(
                        currentStep = uiState.currentStep,
                        totalSteps = 3
                    )
                    
                    Spacer(modifier = Modifier.height(32.dp))
                    
                    // Content based on current step
                    AnimatedContent(
                        targetState = uiState.currentStep,
                        transitionSpec = {
                            slideInHorizontally { it } + fadeIn() with
                                    slideOutHorizontally { -it } + fadeOut()
                        },
                        label = "login_step_animation"
                    ) { step ->
                        when (step) {
                            1 -> PhoneNumberStep(
                                phoneNumber = uiState.phoneNumber,
                                onPhoneNumberChange = viewModel::updatePhoneNumber,
                                onSendOTP = viewModel::sendOTP,
                                isLoading = uiState.isLoading,
                                error = uiState.error
                            )
                            
                            2 -> OTPVerificationStep(
                                otp = uiState.otp,
                                onOTPChange = viewModel::updateOTP,
                                onVerifyOTP = viewModel::verifyOTP,
                                onResendOTP = viewModel::sendOTP,
                                isLoading = uiState.isLoading,
                                error = uiState.error,
                                phoneNumber = uiState.phoneNumber
                            )
                            
                            3 -> UsernameStep(
                                username = uiState.username,
                                onUsernameChange = viewModel::updateUsername,
                                onComplete = {
                                    viewModel.completeRegistration()
                                    onLoginSuccess()
                                },
                                isLoading = uiState.isLoading,
                                error = uiState.error
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Terms and Privacy
            Text(
                text = "By continuing, you agree to our Terms of Service",
                fontSize = 12.sp,
                color = Color.White.copy(alpha = 0.7f),
                textAlign = TextAlign.Center
            )
        }
    }
    
    // Handle successful login
    LaunchedEffect(uiState.isLoggedIn) {
        if (uiState.isLoggedIn) {
            onLoginSuccess()
        }
    }
}

@Composable
private fun StepIndicator(
    currentStep: Int,
    totalSteps: Int
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        repeat(totalSteps) { index ->
            val isActive = index + 1 <= currentStep
            val isCompleted = index + 1 < currentStep
            
            Surface(
                shape = RoundedCornerShape(50),
                color = when {
                    isCompleted -> Color(0xFF4CAF50)
                    isActive -> Color(0xFF667EEA)
                    else -> Color.Gray.copy(alpha = 0.3f)
                },
                modifier = Modifier.size(12.dp)
            ) {}
            
            if (index < totalSteps - 1) {
                Box(
                    modifier = Modifier
                        .width(24.dp)
                        .height(2.dp)
                        .background(
                            color = if (isCompleted) Color(0xFF4CAF50) else Color.Gray.copy(alpha = 0.3f),
                            shape = RoundedCornerShape(1.dp)
                        )
                )
            }
        }
    }
}

@Composable
private fun PhoneNumberStep(
    phoneNumber: String,
    onPhoneNumberChange: (String) -> Unit,
    onSendOTP: () -> Unit,
    isLoading: Boolean,
    error: String?
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = Icons.Default.Phone,
            contentDescription = null,
            tint = Color(0xFF667EEA),
            modifier = Modifier
                .size(48.dp)
                .padding(bottom = 16.dp)
        )
        
        Text(
            text = "Enter Your Phone Number",
            fontSize = 20.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.Black,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        Text(
            text = "We'll send you a verification code to confirm your identity",
            fontSize = 14.sp,
            color = Color.Gray,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(bottom = 24.dp)
        )
        
        OutlinedTextField(
            value = phoneNumber,
            onValueChange = onPhoneNumberChange,
            label = { Text("Phone Number") },
            placeholder = { Text("+1234567890") },
            leadingIcon = {
                Icon(Icons.Default.Phone, contentDescription = null)
            },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            isError = error != null
        )
        
        if (error != null) {
            Text(
                text = error,
                color = MaterialTheme.colorScheme.error,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = onSendOTP,
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading && phoneNumber.isNotBlank(),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF667EEA)
            )
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            } else {
                Text("Send OTP", fontSize = 16.sp)
            }
        }
    }
}

@Composable
private fun OTPVerificationStep(
    otp: String,
    onOTPChange: (String) -> Unit,
    onVerifyOTP: () -> Unit,
    onResendOTP: () -> Unit,
    isLoading: Boolean,
    error: String?,
    phoneNumber: String
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = Icons.Default.Security,
            contentDescription = null,
            tint = Color(0xFF667EEA),
            modifier = Modifier
                .size(48.dp)
                .padding(bottom = 16.dp)
        )
        
        Text(
            text = "Verify OTP",
            fontSize = 20.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.Black,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        Text(
            text = "Enter the 6-digit code sent to $phoneNumber",
            fontSize = 14.sp,
            color = Color.Gray,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(bottom = 24.dp)
        )
        
        OutlinedTextField(
            value = otp,
            onValueChange = { if (it.length <= 6) onOTPChange(it) },
            label = { Text("OTP Code") },
            placeholder = { Text("123456") },
            leadingIcon = {
                Icon(Icons.Default.Security, contentDescription = null)
            },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            isError = error != null
        )
        
        if (error != null) {
            Text(
                text = error,
                color = MaterialTheme.colorScheme.error,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = onVerifyOTP,
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading && otp.length == 6,
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF667EEA)
            )
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            } else {
                Text("Verify OTP", fontSize = 16.sp)
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        TextButton(onClick = onResendOTP) {
            Text("Resend OTP", color = Color(0xFF667EEA))
        }
    }
}

@Composable
private fun UsernameStep(
    username: String,
    onUsernameChange: (String) -> Unit,
    onComplete: () -> Unit,
    isLoading: Boolean,
    error: String?
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = Icons.Default.Person,
            contentDescription = null,
            tint = Color(0xFF667EEA),
            modifier = Modifier
                .size(48.dp)
                .padding(bottom = 16.dp)
        )
        
        Text(
            text = "Choose Username",
            fontSize = 20.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.Black,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        Text(
            text = "Pick a unique username for your temporary profile",
            fontSize = 14.sp,
            color = Color.Gray,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(bottom = 24.dp)
        )
        
        OutlinedTextField(
            value = username,
            onValueChange = onUsernameChange,
            label = { Text("Username") },
            placeholder = { Text("cooluser123") },
            leadingIcon = {
                Icon(Icons.Default.Person, contentDescription = null)
            },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            isError = error != null
        )
        
        if (error != null) {
            Text(
                text = error,
                color = MaterialTheme.colorScheme.error,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = onComplete,
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading && username.isNotBlank(),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF667EEA)
            )
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            } else {
                Text("Complete Registration", fontSize = 16.sp)
            }
        }
    }
}