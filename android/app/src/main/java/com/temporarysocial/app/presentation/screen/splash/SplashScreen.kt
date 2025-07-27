package com.temporarysocial.app.presentation.screen.splash

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onSplashFinished: () -> Unit
) {
    val configuration = LocalConfiguration.current
    val screenHeight = configuration.screenHeightDp.dp
    val screenWidth = configuration.screenWidthDp.dp
    
    // Animation values
    val infiniteTransition = rememberInfiniteTransition(label = "splash_animation")
    
    val logoScale by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = EaseInOutCubic),
            repeatMode = RepeatMode.Reverse
        ),
        label = "logo_scale"
    )
    
    val loadingRotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "loading_rotation"
    )
    
    // Slide-in animations for text
    var showTitle by remember { mutableStateOf(false) }
    var showSubtitle by remember { mutableStateOf(false) }
    var showFeatures by remember { mutableStateOf(false) }
    
    val titleOffset by animateDpAsState(
        targetValue = if (showTitle) 0.dp else 50.dp,
        animationSpec = tween(800, easing = EaseOutCubic),
        label = "title_offset"
    )
    
    val subtitleOffset by animateDpAsState(
        targetValue = if (showSubtitle) 0.dp else 50.dp,
        animationSpec = tween(800, delayMillis = 300, easing = EaseOutCubic),
        label = "subtitle_offset"
    )
    
    val featuresOffset by animateDpAsState(
        targetValue = if (showFeatures) 0.dp else 100.dp,
        animationSpec = tween(800, delayMillis = 600, easing = EaseOutCubic),
        label = "features_offset"
    )
    
    LaunchedEffect(Unit) {
        showTitle = true
        delay(300)
        showSubtitle = true
        delay(300)
        showFeatures = true
        delay(2000) // Show splash for 2 seconds minimum
        onSplashFinished()
    }
    
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
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Brain emoji logo with animation
            Text(
                text = "🧠",
                fontSize = (60 * logoScale).sp,
                modifier = Modifier
                    .scale(logoScale)
                    .padding(bottom = 24.dp)
            )
            
            // App title
            Text(
                text = "Temporary Social",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .offset(y = titleOffset)
                    .padding(horizontal = 32.dp)
            )
            
            // Subtitle
            Text(
                text = "Ephemeral connections that matter",
                fontSize = 16.sp,
                color = Color.White.copy(alpha = 0.9f),
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .offset(y = subtitleOffset)
                    .padding(horizontal = 32.dp, vertical = 8.dp)
            )
            
            Spacer(modifier = Modifier.height(48.dp))
            
            // Loading indicator
            CircularProgressIndicator(
                color = Color.White,
                strokeWidth = 3.dp,
                modifier = Modifier.size(48.dp)
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "Loading your 5-hour experience...",
                fontSize = 14.sp,
                color = Color.White.copy(alpha = 0.8f),
                textAlign = TextAlign.Center
            )
        }
        
        // Feature badges at bottom
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .offset(y = featuresOffset)
                .padding(bottom = 64.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(horizontal = 16.dp)
            ) {
                FeatureBadge("⚡ Instant Messages")
                FeatureBadge("💳 UPI Payments")
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(horizontal = 16.dp)
            ) {
                FeatureBadge("📱 Social Feed")
                FeatureBadge("🔒 Auto-Expire")
            }
        }
    }
}

@Composable
private fun FeatureBadge(text: String) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = Color.White.copy(alpha = 0.1f),
        modifier = Modifier.padding(2.dp)
    ) {
        Text(
            text = text,
            fontSize = 12.sp,
            color = Color.White,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}