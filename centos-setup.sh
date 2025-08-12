#!/bin/bash

# EZ-GEN CentOS Setup Script
# Run this script after extracting the ZIP file

set -e

echo "🚀 EZ-GEN CentOS Setup Starting..."
echo "This script will install all required dependencies for EZ-GEN"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo yum update -y
sudo yum install -y epel-release curl wget unzip git

# Install development tools
echo "🔧 Installing development tools..."
sudo yum groupinstall -y "Development Tools"

# Install Node.js 20.x
echo "📥 Installing Node.js 20.x..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo yum install -y nodejs
else
    echo "✅ Node.js 20+ already installed"
fi

# Verify Node.js installation
NODE_VERSION=$(node -v)
echo "✅ Node.js version: $NODE_VERSION"

# Install Java 21
echo "☕ Installing OpenJDK 21..."
if ! command -v java &> /dev/null || [[ $(java -version 2>&1 | head -n1 | cut -d'"' -f2 | cut -d'.' -f1) -lt 21 ]]; then
    sudo yum install -y java-21-openjdk java-21-openjdk-devel
else
    echo "✅ Java 21+ already installed"
fi

# Set JAVA_HOME
JAVA_HOME="/usr/lib/jvm/java-21-openjdk"
if ! grep -q "JAVA_HOME" ~/.bashrc; then
    echo "export JAVA_HOME=$JAVA_HOME" >> ~/.bashrc
    echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> ~/.bashrc
fi
export JAVA_HOME=$JAVA_HOME
export PATH=$JAVA_HOME/bin:$PATH

# Verify Java installation
JAVA_VERSION=$(java -version 2>&1 | head -n1)
echo "✅ Java version: $JAVA_VERSION"

# Install Android SDK
echo "📱 Installing Android SDK..."
ANDROID_DIR="$HOME/Android"

if [ ! -d "$ANDROID_DIR/cmdline-tools/latest" ]; then
    mkdir -p "$ANDROID_DIR"
    cd "$ANDROID_DIR"
    
    # Download Android SDK Command Line Tools
    SDK_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    wget -O cmdline-tools.zip "$SDK_URL"
    unzip -q cmdline-tools.zip
    rm cmdline-tools.zip
    
    # Set up proper directory structure
    mkdir -p cmdline-tools/latest
    mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
    rmdir cmdline-tools/cmdline-tools 2>/dev/null || true
else
    echo "✅ Android SDK already installed"
fi

# Set Android environment variables
if ! grep -q "ANDROID_SDK_ROOT" ~/.bashrc; then
    echo "export ANDROID_SDK_ROOT=$ANDROID_DIR" >> ~/.bashrc
    echo 'export PATH=$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH' >> ~/.bashrc
fi
export ANDROID_SDK_ROOT="$ANDROID_DIR"
export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"

# Install SDK components
if [ ! -d "$ANDROID_DIR/platforms/android-34" ]; then
    echo "📦 Installing Android SDK components..."
    yes | "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null 2>&1
    "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" \
        "platform-tools" "platforms;android-34" "build-tools;34.0.0" >/dev/null 2>&1
else
    echo "✅ Android SDK components already installed"
fi

# Go back to EZ-GEN directory
cd "$(dirname "$0")"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install global packages
echo "🌐 Installing global npm packages..."
sudo npm install -g @ionic/cli @capacitor/cli pm2

# Create uploads directory
mkdir -p uploads

# Set proper permissions
chmod +x *.sh 2>/dev/null || true
find templates -name "gradlew" -exec chmod +x {} \; 2>/dev/null || true

# Configure firewall (if firewalld is running)
if systemctl is-active --quiet firewalld; then
    echo "🔥 Configuring firewall..."
    sudo firewall-cmd --permanent --add-port=3000/tcp >/dev/null 2>&1 || true
    sudo firewall-cmd --reload >/dev/null 2>&1 || true
fi

echo ""
echo "🎉 EZ-GEN setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "  ✅ Node.js: $(node -v)"
echo "  ✅ Java: $(java -version 2>&1 | head -n1 | cut -d'"' -f2)"
echo "  ✅ Android SDK: $ANDROID_SDK_ROOT"
echo "  ✅ Dependencies installed"
echo "  ✅ Firewall configured (port 3000)"
echo ""
echo "🚀 To start EZ-GEN:"
echo "  npm start"
echo ""
echo "🌐 Access the app at:"
echo "  http://your-server-ip:3000"
echo ""
echo "📝 For production deployment, consider:"
echo "  pm2 start server.js --name ez-gen"
echo "  pm2 startup && pm2 save"
echo ""
echo "🔧 If you need to reload environment variables:"
echo "  source ~/.bashrc"
