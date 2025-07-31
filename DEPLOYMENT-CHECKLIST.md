# 📋 Linux Deployment Checklist

Use this checklist when deploying EZ-GEN to a Linux server.

## Pre-Deployment Preparation

- [ ] Read [LINUX-DEPLOYMENT.md](LINUX-DEPLOYMENT.md) completely
- [ ] Backup all Firebase configuration files
- [ ] Note down all environment variables from Windows setup
- [ ] Export any custom keystore files

## Linux Server Setup

### 1. System Requirements
- [ ] Ubuntu 20.04+ / CentOS 8+ / Similar Linux distribution
- [ ] At least 4GB RAM
- [ ] At least 20GB free disk space
- [ ] Root or sudo access

### 2. Install Dependencies
- [ ] Install Node.js 18+
- [ ] Install Java/OpenJDK 17+
- [ ] Install Android SDK command line tools
- [ ] Install build tools (git, curl, wget, unzip)

### 3. Environment Setup
- [ ] Set JAVA_HOME environment variable
- [ ] Set ANDROID_SDK_ROOT environment variable
- [ ] Update PATH to include SDK tools
- [ ] Accept Android SDK licenses

### 4. File Transfer & Permissions
- [ ] Transfer EZ-GEN project files to server
- [ ] Make shell scripts executable: `chmod +x *.sh`
- [ ] Make gradlew files executable in templates
- [ ] Set proper file ownership and permissions

### 5. Configuration
- [ ] Copy .env file with correct values
- [ ] Update Firebase configuration files
- [ ] Verify all directory paths in .env
- [ ] Test file upload permissions

### 6. Testing
- [ ] Start server: `npm start`
- [ ] Test app generation via API
- [ ] Verify APK build process works
- [ ] Test push notification system

### 7. Production Setup (Optional)
- [ ] Create systemd service
- [ ] Setup reverse proxy (nginx/apache)
- [ ] Configure SSL certificates
- [ ] Setup firewall rules
- [ ] Configure log rotation

## Quick Commands Reference

```bash
# Install dependencies (Ubuntu/Debian)
sudo apt update
sudo apt install openjdk-17-jdk nodejs npm git curl wget unzip build-essential

# Install global Node.js packages
npm install -g @ionic/cli @capacitor/cli

# Set Java environment
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc

# Make scripts executable
chmod +x setup-app.sh check-apk-signature.sh
find . -name "gradlew" -exec chmod +x {} \;

# Start the application
npm install
npm start
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `keytool` not found | Install Java JDK and set JAVA_HOME |
| `gradlew` permission denied | Run `chmod +x android/gradlew` |
| Android SDK not found | Install SDK and set ANDROID_SDK_ROOT |
| Port 3002 already in use | Check other services: `sudo netstat -tulpn \| grep :3002` |
| Firebase config missing | Copy firebase config files to correct locations |

## Support

- Full deployment guide: [LINUX-DEPLOYMENT.md](LINUX-DEPLOYMENT.md)
- Setup requirements: [SETUP-REQUIREMENTS.md](SETUP-REQUIREMENTS.md)
- Environment config: [.env.example](.env.example)
