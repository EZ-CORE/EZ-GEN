# Android Build Troubleshooting Guide

## 🚨 Common "Release build failed with exit code: 1" Solutions

This error typically occurs when the Android build environment is not properly configured. Follow these steps to diagnose and fix the issue.

## 🔍 Quick Diagnosis

Run the build environment checker:

```bash
# Windows
scripts\check-build-environment.bat

# Linux/macOS
./scripts/check-build-environment.sh

# Or via npm
npm run check-environment
```

## 🛠️ Common Issues and Solutions

### 1. Missing Android SDK

**Error indicators:**
- "ANDROID_HOME not set"
- "SDK location not found"

**Solution:**
1. Install Android Studio: https://developer.android.com/studio
2. Set environment variables:

**Windows:**
```cmd
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools"
```

**Linux/macOS:**
```bash
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc
```

### 2. Missing or Wrong Java Version

**Error indicators:**
- "Java not found"
- "Unsupported Java version"

**Solution:**
Install Java 11 or 17 (recommended):

**Windows:**
- Download from https://adoptium.net/
- Or use Chocolatey: `choco install openjdk17`

**Linux:**
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

**macOS:**
```bash
brew install openjdk@17
```

### 3. Gradle Build Issues

**Error indicators:**
- "Gradle sync failed"
- "Could not resolve dependencies"

**Solution:**
```bash
cd android
./gradlew clean
./gradlew build --refresh-dependencies
```

### 4. Keystore Generation Issues

**Error indicators:**
- "keytool not found"
- "Keystore generation failed"

**Solution:**
- Ensure Java is properly installed
- Verify keytool is in PATH: `keytool -help`

### 5. Permission Issues (Linux/macOS)

**Error indicators:**
- "Permission denied"
- "gradlew: command not found"

**Solution:**
```bash
chmod +x android/gradlew
```

### 6. Windows Path Issues

**Error indicators:**
- "CreateProcess error=2"
- "The system cannot find the file specified"

**Solution:**
- Use PowerShell or Command Prompt as Administrator
- Ensure all paths use backslashes on Windows
- Check for spaces in paths (use quotes if needed)

## 🔧 Environment Setup Checklist

Before building, ensure you have:

- [ ] ✅ Node.js (v16 or higher)
- [ ] ✅ Java 11 or 17
- [ ] ✅ Android SDK installed
- [ ] ✅ ANDROID_HOME or ANDROID_SDK_ROOT set
- [ ] ✅ Platform-tools in PATH
- [ ] ✅ Accept Android SDK licenses: `$ANDROID_HOME/tools/bin/sdkmanager --licenses`

## 🐛 Debug Build Issues

### Enable Verbose Logging

The updated EZ-GEN now includes detailed logging. Check the console output for:

1. **Environment variables**
2. **File existence checks**
3. **Detailed Gradle output**
4. **Specific error messages**

### Manual Build Test

Test the build manually:

```bash
cd your-generated-app/android
./gradlew clean
./gradlew assembleDebug --stacktrace --info
```

### Check Generated Files

Verify these files exist in your generated app:
- `android/app/build.gradle`
- `android/gradlew` (executable)
- `android/app/release-key.keystore`
- `android/local.properties`

## 🚀 Docker Alternative

If you continue having environment issues, consider using Docker:

```bash
cd your-project
docker-compose up --build
```

## 📞 Getting Help

If you're still having issues:

1. Run `scripts\check-build-environment.bat` (Windows) or `./scripts/check-build-environment.sh` (Linux/macOS) and share the output
2. Share the full error log from the console
3. Include your OS and version information
4. Check if the issue is environment-specific by trying on a different machine

## 📚 Additional Resources

- [Android Developer Guide](https://developer.android.com/studio/build/building-cmdline)
- [Capacitor Android Setup](https://capacitorjs.com/docs/android)
- [Gradle Build Troubleshooting](https://docs.gradle.org/current/userguide/troubleshooting.html)

---

**Last Updated:** $(date)
**Version:** EZ-GEN v2.0
