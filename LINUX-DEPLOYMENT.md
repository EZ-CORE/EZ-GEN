# Linux Server Deployment Guide

This document outlines all the changes needed to deploy EZ-GEN on a Linux server.

## 🔧 Required Changes for Linux Deployment

### 1. Windows Batch Scripts → Shell Scripts

**Files to Replace:**
- `setup-app.bat` → `setup-app.sh`
- `check-apk-signature.bat` → `check-apk-signature.sh`

**Action Required:** Convert Windows batch scripts to Linux shell scripts.

### 2. Gradle Wrapper Already Linux-Compatible ✅

**Good News:** The gradle command logic in `server.js` is already cross-platform:
```javascript
const gradlewCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
```

**Files that work on Linux:**
- `gradlew` (shell script) - already present in android directories
- `gradlew.bat` (Windows batch) - will be ignored on Linux

### 3. Java/JDK Requirements

**Linux Requirements:**
- Install OpenJDK 17 or higher
- Set `JAVA_HOME` environment variable
- Ensure `keytool` is in PATH (comes with JDK)

**Commands for Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
```

**Commands for CentOS/RHEL:**
```bash
sudo yum install java-17-openjdk-devel
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk' >> ~/.bashrc
```

### 4. Android SDK Requirements

**Linux Installation:**
1. Download Android Command Line Tools
2. Set `ANDROID_SDK_ROOT` environment variable
3. Install platform-tools and build-tools

**Installation Commands:**
```bash
# Download and extract Android command line tools
wget https://dl.google.com/android/repository/commandlinetools-linux-latest.zip
unzip commandlinetools-linux-latest.zip
mkdir -p ~/android-sdk/cmdline-tools/latest
mv cmdline-tools/* ~/android-sdk/cmdline-tools/latest/

# Set environment variables
export ANDROID_SDK_ROOT=~/android-sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools

# Add to bashrc
echo 'export ANDROID_SDK_ROOT=~/android-sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools' >> ~/.bashrc

# Accept licenses and install components
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### 5. Node.js and Dependencies

**Required Packages:**
```bash
# Install Node.js (via NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install global dependencies
npm install -g @ionic/cli @capacitor/cli
```

### 6. System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y git curl wget unzip build-essential
```

**CentOS/RHEL:**
```bash
sudo yum install -y git curl wget unzip gcc gcc-c++ make
```

### 7. File Permissions

**Make gradlew executable:**
```bash
# For all generated apps
find generated-apps/ -name "gradlew" -exec chmod +x {} \;
# For template
chmod +x templates/ionic-webview-template/android/gradlew
```

### 8. Path Separators Already Handled ✅

The code already uses `path.join()` for cross-platform path handling:
```javascript
const keystorePath = path.join(appDir, 'keystore.jks');
const androidDir = path.join(appPath, 'android');
```

### 9. Environment Configuration

**Update .env for Linux paths:**
```bash
# Use forward slashes (Node.js handles this automatically)
FIREBASE_SERVICE_ACCOUNT_PATH=./push-notification-system/firebase-setup/service-account-key.json
ANDROID_KEYSTORE_PATH=./android-signing/release-key.keystore
```

### 10. Service/Daemon Setup (Production)

**Create systemd service file:** `/etc/systemd/system/ez-gen.service`
```ini
[Unit]
Description=EZ-GEN App Generator
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/ez-gen
Environment=NODE_ENV=production
Environment=PORT=3002
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable ez-gen
sudo systemctl start ez-gen
```

## 🚨 Critical Files That Need Linux Equivalents

### 1. setup-app.sh (convert from setup-app.bat)
- Install npm dependencies
- Setup Firebase configuration
- Generate assets and sync Capacitor

### 2. check-apk-signature.sh (convert from check-apk-signature.bat)
- Verify APK signatures using keytool
- Cross-platform APK validation

## ✅ What's Already Linux-Compatible

1. **Node.js server code** - Uses cross-platform modules
2. **Gradle wrapper handling** - Automatically detects platform
3. **Path handling** - Uses `path.join()` for cross-platform paths
4. **Process spawning** - `spawn()` commands work on Linux
5. **Firebase integration** - Platform agnostic
6. **File operations** - Uses Node.js fs module

## 🔄 Migration Checklist

- [ ] Install Java 17+ and set JAVA_HOME
- [ ] Install Android SDK and set ANDROID_SDK_ROOT
- [ ] Install Node.js 18+ and global packages
- [ ] Create shell script equivalents of .bat files
- [ ] Set proper file permissions for gradlew
- [ ] Copy environment configuration
- [ ] Test app generation workflow
- [ ] Setup production service/daemon
- [ ] Configure firewall for port 3002
- [ ] Setup SSL/reverse proxy if needed

## 📝 Testing Deployment

After setup, test the complete workflow:
```bash
# 1. Start the server
npm start

# 2. Generate a test app via API
curl -X POST http://localhost:3002/api/generate-app \
  -H "Content-Type: application/json" \
  -d '{"appName":"TestApp","packageName":"com.test.app"}'

# 3. Verify APK generation works
# Check generated-apps/ directory for successful builds
```

## 🔧 Troubleshooting Common Linux Issues

1. **Permission denied on gradlew**: `chmod +x android/gradlew`
2. **Java not found**: Verify JAVA_HOME and PATH
3. **Android SDK issues**: Check ANDROID_SDK_ROOT and accept licenses
4. **Port already in use**: Check for other services on port 3002
5. **File permission issues**: Ensure correct ownership and permissions
