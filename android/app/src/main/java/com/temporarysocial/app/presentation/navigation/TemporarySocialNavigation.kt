package com.temporarysocial.app.presentation.navigation

import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.temporarysocial.app.presentation.screen.auth.LoginScreen
import com.temporarysocial.app.presentation.screen.splash.SplashScreen
import com.temporarysocial.app.presentation.viewmodel.MainViewModel

@Composable
fun TemporarySocialNavigation(
    navController: NavHostController,
    mainViewModel: MainViewModel = hiltViewModel()
) {
    val isLoading by mainViewModel.isLoading.collectAsState()
    val isLoggedIn by mainViewModel.isLoggedIn.collectAsState()
    
    NavHost(
        navController = navController,
        startDestination = "splash"
    ) {
        composable("splash") {
            SplashScreen(
                onSplashFinished = {
                    if (isLoggedIn) {
                        navController.navigate("dashboard") {
                            popUpTo("splash") { inclusive = true }
                        }
                    } else {
                        navController.navigate("login") {
                            popUpTo("splash") { inclusive = true }
                        }
                    }
                }
            )
        }
        
        composable("login") {
            LoginScreen(
                onLoginSuccess = {
                    mainViewModel.setLoggedIn(true)
                    navController.navigate("dashboard") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            )
        }
        
        composable("dashboard") {
            DashboardScreen()
        }
        
        composable("chat") {
            ChatScreen()
        }
        
        composable("feed") {
            FeedScreen()
        }
        
        composable("search") {
            SearchScreen()
        }
        
        composable("payments") {
            PaymentsScreen()
        }
        
        composable("profile") {
            ProfileScreen()
        }
    }
}

// Placeholder screens - these would be implemented with full functionality
@Composable
fun DashboardScreen() {
    // TODO: Implement dashboard with session timer, quick actions, etc.
}

@Composable
fun ChatScreen() {
    // TODO: Implement chat interface with real-time messaging
}

@Composable
fun FeedScreen() {
    // TODO: Implement social media feed with YouTube/Instagram integration
}

@Composable
fun SearchScreen() {
    // TODO: Implement user search and friend discovery
}

@Composable
fun PaymentsScreen() {
    // TODO: Implement UPI payment interface
}

@Composable
fun ProfileScreen() {
    // TODO: Implement user profile management
}