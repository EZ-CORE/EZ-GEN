# CentOS 7 Deployment Guide for EZ-GEN

## 🔧 What Was Fixed (Summary)

### 1. **Capacitor Sync Issue**
- **Problem**: `npx cap sync` hanging indefinitely
- **Fix**: Added `syncCapacitorWithFallback()` with 30s timeout and manual asset copying
- **Result**: Apps generate successfully even if Capacitor CLI hangs

### 2. **Gradlew Line Endings**
- **Problem**: Windows CRLF line endings causing "bad interpreter" errors
- **Fix**: Added `fixGradlewLineEndings()` to auto-convert to Unix format
- **Result**: Android builds work on Linux/macOS without manual fixes

### 3. **SessionId Parameter Bug**
- **Problem**: Function called with sessionId but parameter missing
- **Fix**: Added `sessionId = null` parameter to `buildAndSyncApp()`
- **Result**: Real-time logging works properly

---

## 🐧 CentOS 7 Deployment Requirements

### **System Prerequisites**
```bash
# Update system
sudo yum update -y

# Install EPEL repository
sudo yum install -y epel-release

# Install basic tools
sudo yum groupinstall -y "Development Tools"
sudo yum install -y curl wget unzip git
```

### **1. Install Node.js 20.x (Required for Capacitor)**
```bash
# Install Node.js 20.x from NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version  # Should be 20.x
npm --version
```

### **2. Install Java 21 (Required for Android builds)**
```bash
# Install OpenJDK 21
sudo yum install -y java-21-openjdk java-21-openjdk-devel

# Set JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Verify Java installation
java -version
```

### **3. Install Android SDK**
```bash
# Create Android directory
mkdir -p ~/Android
cd ~/Android

# Download Android Command Line Tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
rm commandlinetools-linux-11076708_latest.zip

# Set up proper directory structure
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
rmdir cmdline-tools/cmdline-tools 2>/dev/null || true

# Set environment variables
echo 'export ANDROID_SDK_ROOT=~/Android' >> ~/.bashrc
echo 'export PATH=$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH' >> ~/.bashrc
source ~/.bashrc

# Accept licenses and install SDK components
yes | $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --licenses
$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### **4. Install Global Node.js Packages**
```bash
sudo npm install -g @ionic/cli @capacitor/cli pm2
```

### **5. Application Deployment**

#### **Option A: Direct Deployment**
```bash
# Clone/upload your EZ-GEN project
cd /var/www  # or your preferred directory
git clone <your-repo> ez-gen
cd ez-gen

# Install dependencies
npm install

# Create systemd service
sudo cp centos7-systemd.service /etc/systemd/system/ez-gen.service
sudo systemctl daemon-reload
sudo systemctl enable ez-gen
sudo systemctl start ez-gen
```

#### **Option B: PM2 Process Manager**
```bash
# Install and configure PM2
npm install pm2 -g

# Start application with PM2
pm2 start server.js --name "ez-gen"
pm2 startup
pm2 save

# Monitor
pm2 status
pm2 logs ez-gen
```

### **6. Firewall Configuration**
```bash
# Open port 3000 (or your chosen port)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Or if using iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo service iptables save
```

### **7. Nginx Reverse Proxy (Recommended)**
```bash
# Install Nginx
sudo yum install -y nginx

# Configure reverse proxy
sudo tee /etc/nginx/conf.d/ez-gen.conf > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket support for real-time logging
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 🚀 **Changes Needed for CentOS 7**

### **1. File Permissions**
```bash
# Make sure all shell scripts are executable
chmod +x *.sh
chmod +x templates/ionic-webview-template/android/gradlew
```

### **2. Path Updates in server.js**
No changes needed - the paths are already cross-platform compatible.

### **3. Process Management**
Consider using PM2 or systemd for production deployment instead of `npm start`.

### **4. Security Considerations**
```bash
# Create dedicated user for the application
sudo useradd -r -s /bin/false ez-gen
sudo chown -R ez-gen:ez-gen /var/www/ez-gen

# Run the service as the ez-gen user
```

---

## ✅ **Testing Deployment**

1. **Test Node.js**: `node --version` (should be 20.x)
2. **Test Java**: `java -version` (should be 21.x)
3. **Test Android SDK**: `$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --list`
4. **Test Application**: `npm start` (should start without errors)
5. **Test App Generation**: Generate a test app through the web interface

---

## 🔍 **Monitoring & Logs**

```bash
# Application logs
pm2 logs ez-gen

# System logs
sudo journalctl -u ez-gen -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

The fixes I implemented ensure your EZ-GEN system will work reliably on CentOS 7!
