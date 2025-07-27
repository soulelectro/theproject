package com.temporarysocial.app.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.WindowCompat
import androidx.navigation.compose.rememberNavController
import com.google.accompanist.systemuicontroller.rememberSystemUiController
import com.temporarysocial.app.presentation.navigation.TemporarySocialNavigation
import com.temporarysocial.app.presentation.theme.TemporarySocialTheme
import com.temporarysocial.app.presentation.viewmodel.MainViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    private val viewModel: MainViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        // Install splash screen
        val splashScreen = installSplashScreen()
        
        super.onCreate(savedInstanceState)
        
        // Enable edge-to-edge
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        // Keep splash screen until data is loaded
        splashScreen.setKeepOnScreenCondition {
            viewModel.isLoading.value
        }
        
        setContent {
            TemporarySocialTheme {
                SetupSystemUI()
                
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    TemporarySocialApp()
                }
            }
        }
    }
}

@Composable
private fun SetupSystemUI() {
    val systemUiController = rememberSystemUiController()
    val primaryColor = MaterialTheme.colorScheme.primary
    
    LaunchedEffect(systemUiController) {
        systemUiController.setSystemBarsColor(
            color = primaryColor,
            darkIcons = false
        )
    }
}

@Composable
private fun TemporarySocialApp() {
    val navController = rememberNavController()
    
    TemporarySocialNavigation(
        navController = navController
    )
}