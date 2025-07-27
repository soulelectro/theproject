package com.temporarysocial.app.presentation.screen.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LoginUiState(
    val currentStep: Int = 1,
    val phoneNumber: String = "",
    val otp: String = "",
    val username: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val isLoggedIn: Boolean = false
)

@HiltViewModel
class LoginViewModel @Inject constructor() : ViewModel() {
    
    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()
    
    fun updatePhoneNumber(phoneNumber: String) {
        _uiState.value = _uiState.value.copy(
            phoneNumber = phoneNumber,
            error = null
        )
    }
    
    fun updateOTP(otp: String) {
        _uiState.value = _uiState.value.copy(
            otp = otp,
            error = null
        )
    }
    
    fun updateUsername(username: String) {
        _uiState.value = _uiState.value.copy(
            username = username,
            error = null
        )
    }
    
    fun sendOTP() {
        val phoneNumber = _uiState.value.phoneNumber
        
        if (phoneNumber.isBlank()) {
            _uiState.value = _uiState.value.copy(
                error = "Please enter your phone number"
            )
            return
        }
        
        if (phoneNumber.length < 10) {
            _uiState.value = _uiState.value.copy(
                error = "Please enter a valid phone number"
            )
            return
        }
        
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        
        viewModelScope.launch {
            try {
                // Simulate API call to send OTP
                delay(2000)
                
                // For demo purposes, always succeed
                _uiState.value = _uiState.value.copy(
                    currentStep = 2,
                    isLoading = false,
                    error = null
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Failed to send OTP. Please try again."
                )
            }
        }
    }
    
    fun verifyOTP() {
        val otp = _uiState.value.otp
        
        if (otp.length != 6) {
            _uiState.value = _uiState.value.copy(
                error = "Please enter the 6-digit OTP"
            )
            return
        }
        
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        
        viewModelScope.launch {
            try {
                // Simulate API call to verify OTP
                delay(2000)
                
                // For demo purposes, accept any 6-digit OTP
                if (otp == "123456" || otp.length == 6) {
                    // Check if user exists (simulate with phone number check)
                    val isNewUser = _uiState.value.phoneNumber.endsWith("1") // Simple demo logic
                    
                    if (isNewUser) {
                        // New user - go to username step
                        _uiState.value = _uiState.value.copy(
                            currentStep = 3,
                            isLoading = false,
                            error = null
                        )
                    } else {
                        // Existing user - login directly
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            isLoggedIn = true,
                            error = null
                        )
                    }
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "Invalid OTP. Please try again."
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Failed to verify OTP. Please try again."
                )
            }
        }
    }
    
    fun completeRegistration() {
        val username = _uiState.value.username
        
        if (username.isBlank()) {
            _uiState.value = _uiState.value.copy(
                error = "Please enter a username"
            )
            return
        }
        
        if (username.length < 3) {
            _uiState.value = _uiState.value.copy(
                error = "Username must be at least 3 characters"
            )
            return
        }
        
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        
        viewModelScope.launch {
            try {
                // Simulate API call to create user
                delay(2000)
                
                // For demo purposes, always succeed
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isLoggedIn = true,
                    error = null
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Failed to create account. Please try again."
                )
            }
        }
    }
}