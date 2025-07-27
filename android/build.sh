#!/bin/bash

# 🧠 Temporary Social - Android Build Script
# This script builds the native Android app

set -e

echo "🧠 Building Temporary Social Android App..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the android directory
if [ ! -f "build.gradle" ]; then
    echo -e "${RED}❌ Error: Please run this script from the android directory${NC}"
    exit 1
fi

# Check if gradlew exists
if [ ! -f "gradlew" ]; then
    echo -e "${YELLOW}⚠️  gradlew not found, generating...${NC}"
    gradle wrapper
fi

# Make gradlew executable
chmod +x gradlew

echo -e "${BLUE}📋 Build Options:${NC}"
echo "1. Debug APK (for development)"
echo "2. Release APK (for distribution)"
echo "3. Clean + Debug APK"
echo "4. Run Tests"
echo "5. Install on Device"

read -p "Choose option (1-5): " choice

case $choice in
    1)
        echo -e "${BLUE}🔨 Building Debug APK...${NC}"
        ./gradlew assembleDebug
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Debug APK built successfully!${NC}"
            echo -e "${BLUE}📱 APK Location: app/build/outputs/apk/debug/app-debug.apk${NC}"
            
            # Check if APK exists and show size
            if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
                size=$(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)
                echo -e "${GREEN}📊 APK Size: $size${NC}"
            fi
        else
            echo -e "${RED}❌ Build failed!${NC}"
            exit 1
        fi
        ;;
        
    2)
        echo -e "${BLUE}🔨 Building Release APK...${NC}"
        ./gradlew assembleRelease
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Release APK built successfully!${NC}"
            echo -e "${BLUE}📱 APK Location: app/build/outputs/apk/release/app-release.apk${NC}"
            
            # Check if APK exists and show size
            if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
                size=$(du -h app/build/outputs/apk/release/app-release.apk | cut -f1)
                echo -e "${GREEN}📊 APK Size: $size${NC}"
            fi
        else
            echo -e "${RED}❌ Build failed!${NC}"
            exit 1
        fi
        ;;
        
    3)
        echo -e "${BLUE}🧹 Cleaning project...${NC}"
        ./gradlew clean
        
        echo -e "${BLUE}🔨 Building Debug APK...${NC}"
        ./gradlew assembleDebug
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Clean + Debug APK built successfully!${NC}"
            echo -e "${BLUE}📱 APK Location: app/build/outputs/apk/debug/app-debug.apk${NC}"
        else
            echo -e "${RED}❌ Build failed!${NC}"
            exit 1
        fi
        ;;
        
    4)
        echo -e "${BLUE}🧪 Running Tests...${NC}"
        ./gradlew test
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ All tests passed!${NC}"
        else
            echo -e "${RED}❌ Some tests failed!${NC}"
            exit 1
        fi
        ;;
        
    5)
        echo -e "${BLUE}📱 Installing Debug APK on connected device...${NC}"
        ./gradlew installDebug
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ App installed successfully!${NC}"
            echo -e "${BLUE}🚀 You can now open 'Temporary Social' on your device${NC}"
        else
            echo -e "${RED}❌ Installation failed! Make sure device is connected and USB debugging is enabled.${NC}"
            exit 1
        fi
        ;;
        
    *)
        echo -e "${RED}❌ Invalid option selected${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Build process completed!${NC}"
echo ""
echo -e "${BLUE}📱 Next Steps:${NC}"
echo "• Install the APK on your Android device"
echo "• Test all features: Login, Chat, Payments, Feed"
echo "• Configure API keys in local.properties for full functionality"
echo ""
echo -e "${YELLOW}⚠️  Note: This is a demo build. Configure real API keys for production use.${NC}"