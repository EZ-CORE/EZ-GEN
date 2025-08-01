# FCM Token Debug Steps

## Quick Installation & Testing

1. **Install the APK:**
   ```
   adb install c:\Users\azwad\Desktop\EZ-GEN\generated-apps\0e64fcda-575e-40fb-bf2d-fcd76ddbb22a\android\app\build\outputs\apk\debug\app-debug.apk
   ```

2. **Open the app on your device**

3. **Check Android logs for FCM token:**
   ```
   adb logcat | findstr "FCM\|Firebase\|GMS\|TOKEN"
   ```

4. **If no token appears, try this:**
   - Open the app
   - Grant notification permissions when prompted
   - Look for console logs in Chrome DevTools (chrome://inspect)
   - Check for any error messages

## Common Issues:

1. **Google Play Services not installed** - FCM requires Google Play Services
2. **Network connectivity** - Device needs internet to get FCM token
3. **Permissions denied** - App needs notification permissions
4. **Firebase config** - google-services.json might be incorrect

## Quick Test:
- Open app → Should see alert with FCM token
- If no alert, check Android logs
- Token should appear in console with "🔥 FCM Token received:"
