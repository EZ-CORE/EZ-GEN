#!/bin/bash

# EZ-GEN App Setup Script for Linux
# This script automates the setup process for generated apps

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Java
    if ! command_exists java; then
        print_error "Java is not installed. Please install OpenJDK 17+ first."
        exit 1
    fi
    
    # Check if JAVA_HOME is set
    if [ -z "$JAVA_HOME" ]; then
        print_warning "JAVA_HOME is not set. Android builds may fail."
        print_warning "Please set JAVA_HOME to your JDK installation directory."
    fi
    
    # Check Ionic CLI
    if ! command_exists ionic; then
        print_warning "Ionic CLI not found. Installing globally..."
        npm install -g @ionic/cli
    fi
    
    # Check Capacitor CLI
    if ! command_exists cap; then
        print_warning "Capacitor CLI not found. Installing globally..."
        npm install -g @capacitor/cli
    fi
    
    print_success "Prerequisites check completed!"
}

# Function to setup app
setup_app() {
    local app_path="$1"
    
    if [ -z "$app_path" ]; then
        print_error "Usage: $0 <app_path>"
        exit 1
    fi
    
    if [ ! -d "$app_path" ]; then
        print_error "App directory does not exist: $app_path"
        exit 1
    fi
    
    print_status "Setting up app in: $app_path"
    cd "$app_path"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $app_path"
        exit 1
    fi
    
    # Install dependencies
    print_status "Installing npm dependencies..."
    if npm install; then
        print_success "Dependencies installed successfully!"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
    
    # Check if Capacitor is configured
    if [ ! -f "capacitor.config.ts" ] && [ ! -f "capacitor.config.json" ]; then
        print_warning "Capacitor config not found. Initializing Capacitor..."
        npx cap init
    fi
    
    # Build the app
    print_status "Building the app..."
    if npm run build; then
        print_success "App built successfully!"
    else
        print_error "Failed to build app"
        exit 1
    fi
    
    # Generate assets if capacitor-assets is configured
    if grep -q "capacitor-assets" package.json; then
        print_status "Generating app assets..."
        if npx capacitor-assets generate; then
            print_success "Assets generated successfully!"
        else
            print_warning "Asset generation failed or not configured"
        fi
    fi
    
    # Sync Capacitor
    print_status "Syncing Capacitor..."
    if npx cap sync; then
        print_success "Capacitor sync completed!"
    else
        print_error "Capacitor sync failed"
        exit 1
    fi
    
    # Make gradlew executable if Android platform exists
    if [ -d "android" ] && [ -f "android/gradlew" ]; then
        print_status "Making gradlew executable..."
        chmod +x android/gradlew
        print_success "gradlew permissions set!"
    fi
    
    # Final status check
    print_status "Running final checks..."
    
    # Check if Android platform is available
    if [ -d "android" ]; then
        print_success "✓ Android platform ready"
        
        # Test gradlew
        if [ -f "android/gradlew" ] && [ -x "android/gradlew" ]; then
            print_success "✓ Gradle wrapper is executable"
        else
            print_warning "⚠ Gradle wrapper may have permission issues"
        fi
    else
        print_warning "⚠ Android platform not found. Add with: npx cap add android"
    fi
    
    # Check if iOS platform is available
    if [ -d "ios" ]; then
        print_success "✓ iOS platform ready"
    else
        print_warning "⚠ iOS platform not found. Add with: npx cap add ios"
    fi
    
    print_success "App setup completed successfully!"
    print_status "You can now:"
    print_status "  • Open in Android Studio: npx cap open android"
    print_status "  • Open in Xcode: npx cap open ios"
    print_status "  • Build APK: cd android && ./gradlew assembleDebug"
}

# Main execution
main() {
    echo "=================================="
    echo "    EZ-GEN App Setup (Linux)"
    echo "=================================="
    echo
    
    check_prerequisites
    echo
    setup_app "$1"
    echo
    print_success "Setup script completed!"
}

# Check if script is being sourced or executed
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi
