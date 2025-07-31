# Android Notification Permission Troubleshooting Guide

## Root Causes for Missing Permission Dialog

### 1. **Android 13+ Permission Requirements**
- **Issue**: Android 13 (API 33) and above require explicit `POST_NOTIFICATIONS` permission
- **Solution**: Ensure `<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />` is in AndroidManifest.xml
- **Check**: Look in `android/app/src/main/AndroidManifest.xml`

### 2. **Capacitor Plugin Timing Issues**
- **Issue**: Permission request called too early in app lifecycle
- **Solution**: Added 5-second delay and device ready check
- **Check**: Look for "Waiting for Capacitor to fully initialize" in logs

### 3. **Firebase/Google Play Services Issues**
- **Issue**: FCM requires Google Play Services to be available
- **Solution**: Ensure device has Google Play Services installed and updated
- **Check**: Test on device with Google Play Store

### 4. **App Target SDK Version**
- **Issue**: App must target SDK 33+ for permission dialog to appear
- **Current**: We're targeting SDK 35 (Android 14)
- **Check**: Look in `android/variables.gradle` for `targetSdkVersion = 35`

### 5. **Native Permission Handling**
- **Issue**: Capacitor plugin may not properly trigger native permission dialog
- **Solution**: Added native Android permission helper
- **Check**: `NotificationPermissionHelper.java` and `MainActivity.java` updates

## Enhanced Permission Request Strategy

### Strategy 1: Check Current Status
- First check if permissions are already granted
- Skip request if already has permission

### Strategy 2: Direct Registration
- Try `PushNotifications.register()` first
- Often triggers permission dialog automatically

### Strategy 3: Explicit Permission Request
- Use `PushNotifications.requestPermissions()`
- More explicit but not always reliable

### Strategy 4: Native Android Backup
- Use native Android permission helper
- Guaranteed to show system permission dialog

## Debug Steps

### 1. Check Console Logs
Look for these log patterns:
```
🔧 Starting push notification initialization...
📱 Android Target SDK: 35 (Android 14) - POST_NOTIFICATIONS required
⏳ Waiting for Capacitor to fully initialize...
📱 Checking device ready state...
🎯 Starting advanced permission request sequence...
```

### 2. Verify Manifest Permissions
Check `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### 3. Check Device Settings
- Go to Device Settings > Apps > [App Name] > Notifications
- Verify if notifications are enabled
- If disabled, user can manually enable

### 4. Test Android Versions
- **Android 12 and below**: Permission not required
- **Android 13+**: Explicit permission required
- Test on both to verify behavior

### 5. Firebase Configuration
- Verify `google-services.json` exists in `android/app/`
- Check Firebase project configuration
- Ensure FCM is enabled in Firebase Console

## Testing Commands

### 1. Build and Install
```bash
ionic capacitor run android
```

### 2. View Android Logs
```bash
adb logcat | grep -i notification
```

### 3. Check App Permissions
```bash
adb shell dumpsys package com.ezassist.timeless | grep permission
```

## Expected Behavior

### First App Launch
1. App shows loading screen
2. After 5 seconds, native permission dialog should appear
3. User taps "Allow" or "Don't allow"
4. FCM token should be generated (check logs)

### Permission Dialog Not Showing
- Check if permission already granted in device settings
- Verify Google Play Services availability
- Check console logs for errors
- Try manual permission button (floating button in app)

### FCM Token Generation
- Should see: "🎉 REGISTRATION SUCCESS!" and "🔥 FCM Token received: [token]"
- If missing, check Firebase configuration

## Manual Testing Button

The app includes a floating notification button for manual testing:
- Visible on native Android devices
- Tap to manually trigger permission request
- Located in bottom-right corner of screen

## Advanced Debugging

### Enable WebView Debugging
1. Enable Developer Options on Android device
2. Enable "WebView debugging" 
3. Connect to Chrome DevTools at `chrome://inspect`
4. View console logs in real-time

### Firebase Debug Mode
1. Add to `capacitor.config.ts`:
```typescript
plugins: {
  PushNotifications: {
    presentationOptions: ["badge", "sound", "alert"]
  }
}
```

## Common Solutions

### Solution 1: Clear App Data
- Go to Settings > Apps > [App Name] > Storage
- Tap "Clear Data" and "Clear Cache"
- Reinstall app to reset permission state

### Solution 2: Manual Permission Grant
- Settings > Apps > [App Name] > Notifications
- Toggle "Allow notifications" ON

### Solution 3: Firebase Reconfiguration
- Download fresh `google-services.json` from Firebase Console
- Replace existing file in `android/app/`
- Clean and rebuild app

### Solution 4: Google Play Services Update
- Open Google Play Store
- Search for "Google Play Services"
- Update if available
- Restart device

## Success Indicators

✅ Permission dialog appears on first launch
✅ FCM token generated and logged
✅ Can receive test notifications
✅ Notifications appear in device notification tray
✅ App handles notification taps correctly

## Failure Indicators

❌ No permission dialog appears
❌ No FCM token in logs
❌ Cannot receive notifications
❌ Error messages in console logs
❌ App crashes when requesting permissions
