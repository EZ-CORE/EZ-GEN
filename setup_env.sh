#!/bin/bash
set -e

echo "🔧 Installing dependencies..."
sudo apt update && sudo apt install -y curl unzip zip openjdk-21-jdk

echo "📌 Setting JAVA_HOME..."
JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
echo "export JAVA_HOME=$JAVA_HOME" >> ~/.bashrc
echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> ~/.bashrc
export JAVA_HOME=$JAVA_HOME
export PATH=$JAVA_HOME/bin:$PATH

echo "📦 Installing Android SDK Command Line Tools..."
ANDROID_DIR="$HOME/Android"
mkdir -p "$ANDROID_DIR"
cd "$ANDROID_DIR"

# Clean old downloads if any
rm -rf cmdline-tools sdk-tools.zip

# Download the latest command line tools
SDK_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
curl -o sdk-tools.zip "$SDK_URL"
unzip -q sdk-tools.zip -d temp-tools
rm sdk-tools.zip

# Move into correct structure: cmdline-tools/latest/
mkdir -p cmdline-tools/latest
cp -r temp-tools/cmdline-tools/* cmdline-tools/latest/
rm -rf temp-tools

echo "📌 Setting ANDROID_SDK_ROOT..."
echo "export ANDROID_SDK_ROOT=${ANDROID_DIR}" >> ~/.bashrc
echo 'export PATH=$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH' >> ~/.bashrc
export ANDROID_SDK_ROOT="$ANDROID_DIR"
export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"

echo "✅ Accepting licenses and installing SDK components..."
yes | "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$ANDROID_SDK_ROOT" --licenses
"$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" \
  "platform-tools" "platforms;android-34" "build-tools;34.0.0"

echo "📥 Installing Node.js v20.19.0 and npm..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Check and force install specific version if needed
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="20.19.0"
if dpkg --compare-versions "$NODE_VERSION" lt "$REQUIRED_VERSION"; then
  echo "⚠️ Node.js version is $NODE_VERSION, upgrading to v$REQUIRED_VERSION..."
  sudo npm install -g n
  sudo n $REQUIRED_VERSION
fi

echo "📦 Installing Gradle..."
sudo apt install -y gradle

echo "🌐 Installing global npm packages..."
sudo npm install -g @ionic/cli @capacitor/cli

echo "🔁 Sourcing updated .bashrc..."
source ~/.bashrc

echo "🎉 Environment setup complete. Node version: $(node -v), Java version: $(java -version | head -n 1), Gradle version: $(gradle -v | grep Gradle)"
