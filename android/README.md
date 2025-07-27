# 🧠 Temporary Social - Native Android App

A **native Android application** built with **Kotlin** and **Jetpack Compose** for ephemeral social networking with 5-hour sessions.

## 📱 **Native Android Features**

### ✨ **Modern Android Architecture**
- **Jetpack Compose** for declarative UI
- **Material Design 3** with custom theming
- **MVVM Architecture** with ViewModels
- **Hilt Dependency Injection** for clean code
- **Room Database** for local storage
- **Coroutines** for asynchronous operations

### 🎨 **Beautiful Native UI**
- **Splash Screen API** with animated logo
- **Gradient backgrounds** and glass morphism
- **Smooth animations** and transitions
- **Responsive layouts** for all screen sizes
- **Dark/Light theme** support
- **Edge-to-edge** immersive experience

### 🔐 **Authentication System**
- **OTP-based login** with SMS auto-read
- **Phone number verification** using Google Play Services
- **JWT token management** with automatic refresh
- **Biometric authentication** support (optional)

### 💬 **Real-time Messaging**
- **Socket.IO integration** for instant messaging
- **Ephemeral messages** that expire after 5 hours
- **Push notifications** for new messages
- **Typing indicators** and read receipts
- **Message encryption** for privacy

### 💳 **UPI Payment Integration**
- **Razorpay SDK** for secure payments
- **QR code generation** and scanning
- **UPI deep linking** support
- **Payment history** with auto-expiry
- **Transaction notifications**

### 📱 **Social Media Feed**
- **YouTube Player API** for Shorts
- **WebView integration** for Instagram Reels
- **Infinite scroll** with lazy loading
- **Video caching** for offline viewing
- **Feed refresh** with pull-to-refresh

### 👥 **Social Features**
- **User search** with real-time results
- **Follow/Unfollow** system
- **Profile management** with social links
- **Friend suggestions** algorithm
- **Cross-platform** social linking

### ⏰ **Session Management**
- **Foreground service** for session tracking
- **Persistent notifications** for session timer
- **Auto-logout** when session expires
- **Session extension** with one-tap
- **Background cleanup** of expired data

## 🏗️ **Technical Architecture**

### **Project Structure**
```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/temporarysocial/app/
│   │   │   ├── data/           # Data layer
│   │   │   │   ├── database/   # Room database
│   │   │   │   ├── network/    # Retrofit API
│   │   │   │   ├── repository/ # Repository pattern
│   │   │   │   └── service/    # Background services
│   │   │   ├── domain/         # Domain layer
│   │   │   │   ├── model/      # Data models
│   │   │   │   ├── repository/ # Repository interfaces
│   │   │   │   └── usecase/    # Business logic
│   │   │   ├── presentation/   # Presentation layer
│   │   │   │   ├── screen/     # Compose screens
│   │   │   │   ├── component/  # Reusable components
│   │   │   │   ├── navigation/ # Navigation setup
│   │   │   │   ├── theme/      # Material theming
│   │   │   │   └── viewmodel/  # ViewModels
│   │   │   └── di/             # Dependency injection
│   │   ├── res/                # Android resources
│   │   └── AndroidManifest.xml
│   └── build.gradle            # App dependencies
├── build.gradle                # Project configuration
└── README.md                   # This file
```

### **Key Dependencies**
```gradle
// Core Android
implementation 'androidx.core:core-ktx:1.12.0'
implementation 'androidx.activity:activity-compose:1.8.2'

// Jetpack Compose
implementation 'androidx.compose.material3:material3'
implementation 'androidx.navigation:navigation-compose:2.7.6'

// Architecture Components
implementation 'androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0'
implementation 'com.google.dagger:hilt-android:2.48.1'

// Networking
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'io.socket:socket.io-client:2.1.0'

// Database
implementation 'androidx.room:room-ktx:2.6.1'

// Payments & QR
implementation 'com.razorpay:checkout:1.6.33'
implementation 'com.journeyapps:zxing-android-embedded:4.3.0'

// Media & UI
implementation 'io.coil-kt:coil-compose:2.5.0'
implementation 'com.pierfrancescosoffritti.androidyoutubeplayer:core:12.1.0'
```

## 🚀 **Getting Started**

### **Prerequisites**
- **Android Studio** Arctic Fox or newer
- **Android SDK** 24+ (Android 7.0+)
- **Kotlin** 1.9.22+
- **JDK** 8 or higher

### **Setup Instructions**

1. **Clone the Repository**
```bash
git clone <repository-url>
cd temporary-social-app/android
```

2. **Open in Android Studio**
- Open Android Studio
- Click "Open an existing project"
- Navigate to the `android` folder
- Click "OK"

3. **Configure API Keys**
Create `local.properties` file:
```properties
# Twilio Configuration
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"

# Razorpay Configuration
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# YouTube API
YOUTUBE_API_KEY="your_youtube_api_key"

# Server Configuration
BASE_URL="https://your-server-url.com/api/"
SOCKET_URL="https://your-server-url.com/"
```

4. **Build and Run**
- Connect Android device or start emulator
- Click "Run" button in Android Studio
- Or use command line:
```bash
./gradlew assembleDebug
./gradlew installDebug
```

## 📱 **App Features Demo**

### **1. Splash Screen**
- Animated brain logo 🧠
- Gradient background
- Feature badges
- Smooth transitions

### **2. Authentication Flow**
- Phone number input with validation
- OTP verification with auto-read
- Username selection for new users
- Biometric login for returning users

### **3. Main Dashboard**
- Session timer with countdown
- Quick action cards
- User statistics
- Friend suggestions

### **4. Chat Interface**
- Real-time messaging
- Message bubbles with animations
- Typing indicators
- Message expiry countdown

### **5. Payment System**
- UPI payment interface
- QR code scanner/generator
- Payment history
- Transaction notifications

### **6. Social Feed**
- YouTube Shorts player
- Instagram Reels viewer
- Infinite scroll
- Pull-to-refresh

### **7. Profile Management**
- User profile editing
- Social media links
- Follow/Unfollow buttons
- Session information

## 🔧 **Configuration**

### **Development Build**
```bash
./gradlew assembleDebug
```

### **Release Build**
```bash
./gradlew assembleRelease
```

### **Running Tests**
```bash
./gradlew test
./gradlew connectedAndroidTest
```

## 📦 **APK Generation**

### **Debug APK**
```bash
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```

### **Release APK**
```bash
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk
```

### **App Bundle (for Play Store)**
```bash
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

## 🛡️ **Security Features**

- **Certificate Pinning** for API calls
- **ProGuard/R8** code obfuscation
- **Encrypted SharedPreferences** for sensitive data
- **Network Security Config** for HTTPS enforcement
- **Biometric Authentication** support
- **App Signing** with keystore

## 🎨 **UI/UX Highlights**

### **Material Design 3**
- Dynamic color theming
- Adaptive layouts
- Smooth animations
- Accessibility support

### **Custom Components**
- Gradient buttons
- Glass morphism cards
- Animated session timer
- Custom bottom navigation

### **Responsive Design**
- Phone and tablet support
- Portrait/landscape modes
- Different screen densities
- Accessibility features

## 📊 **Performance Optimizations**

- **Lazy loading** for lists
- **Image caching** with Coil
- **Database indexing** for fast queries
- **Background processing** with WorkManager
- **Memory leak prevention**
- **Battery optimization**

## 🧪 **Testing Strategy**

### **Unit Tests**
- Repository layer testing
- ViewModel testing
- Use case testing
- Utility function testing

### **Integration Tests**
- Database testing
- API integration testing
- Navigation testing

### **UI Tests**
- Compose UI testing
- User flow testing
- Accessibility testing

## 🚀 **Deployment**

### **Google Play Store**
1. Generate signed APK/AAB
2. Create Play Console listing
3. Upload release bundle
4. Configure store listing
5. Submit for review

### **Internal Distribution**
- Firebase App Distribution
- Direct APK sharing
- Internal testing tracks

## 📈 **Analytics & Monitoring**

- **Firebase Analytics** for user behavior
- **Crashlytics** for crash reporting
- **Performance Monitoring** for app performance
- **Custom events** for feature usage

## 🔄 **CI/CD Pipeline**

```yaml
# GitHub Actions example
- name: Build Debug APK
  run: ./gradlew assembleDebug

- name: Run Tests
  run: ./gradlew test

- name: Upload APK
  uses: actions/upload-artifact@v2
  with:
    name: app-debug
    path: app/build/outputs/apk/debug/app-debug.apk
```

## 📱 **Device Compatibility**

- **Minimum SDK**: Android 7.0 (API 24)
- **Target SDK**: Android 14 (API 34)
- **Architecture**: ARM64, ARM, x86_64
- **Screen Sizes**: Phone, Tablet, Foldable
- **RAM**: 2GB minimum, 4GB recommended

## 🎯 **Key Advantages of Native Android**

✅ **Native Performance** - Optimized for Android devices  
✅ **Platform Integration** - Deep Android OS integration  
✅ **Hardware Access** - Camera, sensors, biometrics  
✅ **Play Store Distribution** - Official app store presence  
✅ **Push Notifications** - Native Android notifications  
✅ **Background Processing** - Foreground services, WorkManager  
✅ **Security** - Android security model compliance  
✅ **Offline Support** - Room database, local storage  
✅ **Material Design** - Native Android design language  
✅ **Performance Monitoring** - Android-specific profiling tools  

## 🎉 **Result**

This is a **production-ready native Android app** with:

- ✅ **Beautiful Jetpack Compose UI**
- ✅ **Real-time messaging with Socket.IO**
- ✅ **UPI payments with Razorpay**
- ✅ **Ephemeral 5-hour sessions**
- ✅ **Social media feed integration**
- ✅ **Native Android features**
- ✅ **Material Design 3**
- ✅ **Production-ready architecture**

**Ready to build and deploy to Google Play Store! 📱🚀**