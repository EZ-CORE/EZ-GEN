# CentOS Deployment Checklist for EZ-GEN

## 🚀 **Quick Answer: YES, but requires setup**

Your EZ-GEN project will work on CentOS Linux server after installing dependencies.

## 📋 **Pre-Deployment Checklist**

### **1. System Requirements on CentOS:**
- ✅ **Node.js 20.x** (Required for Capacitor 7.x)
- ✅ **Java 21** (Required for Android builds)
- ✅ **Android SDK** (For generating APKs)
- ✅ **Git** (For potential updates)

### **2. What User Needs to Install:**

#### **Step 1: Update System**
```bash
sudo yum update -y
sudo yum install -y epel-release
sudo yum groupinstall -y "Development Tools"
sudo yum install -y curl wget unzip git
```

#### **Step 2: Install Node.js 20.x**
```bash
# Install Node.js 20.x (Required - your project needs this version)
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Verify
node --version  # Should show v20.x.x
npm --version
```

#### **Step 3: Install Java 21**
```bash
# Install OpenJDK 21 (Required for Android builds)
sudo yum install -y java-21-openjdk java-21-openjdk-devel

# Set JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk' >> ~/.bashrc
source ~/.bashrc

# Verify
java -version  # Should show OpenJDK 21
```

#### **Step 4: Install Android SDK**
```bash
# Create Android directory
mkdir -p ~/Android && cd ~/Android

# Download Android SDK Command Line Tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
rm commandlinetools-linux-11076708_latest.zip

# Set up directory structure
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true

# Set environment variables
echo 'export ANDROID_SDK_ROOT=~/Android' >> ~/.bashrc
echo 'export PATH=$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH' >> ~/.bashrc
source ~/.bashrc

# Install SDK components
yes | $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --licenses
$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### **3. Deploy Your Project:**

#### **Option A: ZIP Upload (What you're asking about)**
```bash
# User uploads your ZIP file to server
cd /var/www  # or chosen directory
unzip ez-gen.zip
cd ez-gen

# Install Node.js dependencies
npm install

# Start the application
npm start
```

#### **Option B: Git Clone (Recommended)**
```bash
# If your repo is public/accessible
git clone https://github.com/shafschwd/EZ-GEN.git
cd EZ-GEN
npm install
npm start
```

## 🛡️ **Production Deployment Considerations**

### **1. Process Management**
```bash
# Install PM2 for production
sudo npm install -g pm2

# Start with PM2
pm2 start server.js --name "ez-gen"
pm2 startup  # Auto-start on boot
pm2 save
```

### **2. Firewall Configuration**
```bash
# Open port 3000 (or your chosen port)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### **3. Nginx Reverse Proxy (Recommended)**
```bash
# Install Nginx
sudo yum install -y nginx

# Configure reverse proxy (sample config)
sudo nano /etc/nginx/conf.d/ez-gen.conf
```

## ⚠️ **Potential Issues & Solutions**

### **Issue 1: Permission Denied**
```bash
# Fix file permissions
chmod +x *.sh
chmod +x templates/ionic-webview-template/android/gradlew
```

### **Issue 2: Port Already in Use**
```bash
# Change port in server.js or kill conflicting process
sudo netstat -tulpn | grep :3000
sudo kill -9 <PID>
```

### **Issue 3: Memory Issues on Small Servers**
```bash
# Monitor memory usage
free -h
# Consider adding swap if needed
```

## ✅ **Testing Deployment**

After setup, test the system:

```bash
# 1. Test Node.js
node --version

# 2. Test Java
java -version

# 3. Test Android SDK
$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --list

# 4. Test your application
cd ez-gen
npm start

# 5. Test app generation
# Visit http://server-ip:3000 and generate a test app
```

## 📦 **What to Include in Your ZIP**

### **Essential Files:**
- ✅ `server.js` - Main application
- ✅ `package.json` - Dependencies
- ✅ `templates/` - App templates
- ✅ `frontend/` - Web interface
- ✅ `Firebase/` - Firebase configs
- ✅ `*.sh` scripts - Setup helpers

### **Optional but Recommended:**
- ✅ `centos-deployment.md` - Instructions
- ✅ `README.md` - Documentation
- ✅ `.env.example` - Environment template

### **Exclude from ZIP:**
- ❌ `node_modules/` - Will be installed via npm
- ❌ `generated-apps/` - Will be created
- ❌ `uploads/` - Will be created
- ❌ `.git/` - Version control (optional)

## 🎯 **Simple Deployment Script**

Create this script for your users:

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Setting up EZ-GEN on CentOS..."

# Install dependencies
sudo yum update -y
sudo yum install -y epel-release curl wget unzip git

# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install Java 21
sudo yum install -y java-21-openjdk java-21-openjdk-devel

# Set environment
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk' >> ~/.bashrc

# Install app dependencies
npm install

echo "✅ Setup complete! Run 'npm start' to start the server."
```

## 📋 **Summary**

**YES**, your project will work on CentOS, but the user needs to:

1. **Install system dependencies** (Node.js 20.x, Java 21, Android SDK)
2. **Run `npm install`** to install Node.js packages
3. **Set up environment variables** for Java and Android SDK
4. **Configure firewall/networking** for port access

**Recommendation**: Include a deployment script and clear instructions with your ZIP file for the smoothest user experience.
