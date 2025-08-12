# EZ-GEN - CentOS Deployment Instructions

## 🚀 **Quick Start for CentOS Linux**

This ZIP package contains the complete EZ-GEN application that can generate Android/iOS apps from websites.

### **📋 Prerequisites**
- CentOS 7+ server with sudo privileges
- Internet connection for downloading dependencies
- At least 2GB RAM and 10GB free disk space

### **⚡ One-Command Setup**

1. **Extract the ZIP file:**
   ```bash
   unzip ez-gen.zip
   cd ez-gen
   ```

2. **Run the setup script:**
   ```bash
   ./centos-setup.sh
   ```

3. **Start the application:**
   ```bash
   npm start
   ```

4. **Access the app:**
   - Open browser: `http://your-server-ip:3000`

### **🛠️ What the Setup Script Does**

- ✅ Installs Node.js 20.x (required for Capacitor)
- ✅ Installs Java 21 (required for Android builds)
- ✅ Downloads and configures Android SDK
- ✅ Installs all Node.js dependencies
- ✅ Sets up environment variables
- ✅ Configures firewall (port 3000)
- ✅ Sets proper file permissions

### **🔧 Manual Setup (if script fails)**

If the automatic setup script doesn't work, follow the manual steps in `centos-deployment-checklist.md`.

### **🎯 Production Deployment**

For production use:

```bash
# Install PM2 process manager
sudo npm install -g pm2

# Start with PM2
pm2 start server.js --name "ez-gen"

# Auto-start on boot
pm2 startup
pm2 save

# Monitor
pm2 status
pm2 logs ez-gen
```

### **🌐 Nginx Reverse Proxy (Optional)**

For domain access and better performance:

```bash
# Install Nginx
sudo yum install -y nginx

# Configure reverse proxy
sudo nano /etc/nginx/conf.d/ez-gen.conf
```

Sample Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **📱 Testing the Installation**

1. **Visit the web interface:** `http://your-server-ip:3000`
2. **Generate a test app:**
   - App Name: "Test App"
   - Website URL: "https://google.com"
   - Package Name: "com.test.app"
3. **Check the results:** Generated app should appear in `generated-apps/` directory
4. **Verify APK build:** Android APK should be buildable

### **🐛 Troubleshooting**

#### **Port 3000 Already in Use**
```bash
sudo netstat -tulpn | grep :3000
sudo kill -9 <PID>
```

#### **Permission Denied Errors**
```bash
chmod +x *.sh
chmod +x templates/ionic-webview-template/android/gradlew
```

#### **Out of Memory**
```bash
# Check memory
free -h

# Add swap if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### **Java/Android SDK Issues**
```bash
# Reload environment variables
source ~/.bashrc

# Check variables
echo $JAVA_HOME
echo $ANDROID_SDK_ROOT
```

### **📞 Support**

If you encounter issues:

1. **Check logs:** Look at the console output when running `npm start`
2. **Check system logs:** `sudo journalctl -u your-service-name`
3. **Verify dependencies:** Run the commands in the troubleshooting section
4. **Check firewall:** Ensure port 3000 is accessible

### **🔒 Security Notes**

- Change default port in `server.js` if needed
- Use Nginx reverse proxy for production
- Consider SSL certificate for HTTPS
- Regular system updates: `sudo yum update`

---

**The EZ-GEN system includes automatic fixes for common deployment issues and should work reliably on CentOS after running the setup script.**
