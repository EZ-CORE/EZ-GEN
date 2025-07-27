# 🔥 Firebase Setup for Push Notifications

## Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Click "Add project" or "Create a project"

2. **Project Configuration**
   - Project name: `ez-gen-notifications` (or your app name)
   - Enable Google Analytics (optional)
   - Choose your region

3. **Add Android App**
   - Click "Add app" → Android icon
   - Android package name: `com.ezassist.yourapp` (match your app's package)
   - App nickname: `EZ-GEN Android`
   - Debug signing certificate SHA-1 (optional for testing)

4. **Add iOS App** (if needed)
   - Click "Add app" → iOS icon
   - iOS bundle ID: `com.ezassist.yourapp`
   - App nickname: `EZ-GEN iOS`

## Step 2: Download Configuration Files

### For Android:
1. Download `google-services.json`
2. Place it in: `android/app/google-services.json`

### For iOS:
1. Download `GoogleService-Info.plist`
2. Place it in: `ios/App/App/GoogleService-Info.plist`

## Step 3: Enable Cloud Messaging

1. In Firebase Console, go to **Build** → **Cloud Messaging**
2. No additional setup needed - FCM is enabled by default

## Step 4: Generate Service Account Key

1. Go to **Project Settings** → **Service accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Rename it to `service-account-key.json`
5. Place it in: `push-notification-system/firebase-setup/service-account-key.json`

⚠️ **IMPORTANT**: Never commit the service account key to version control!

## Step 5: Configure Environment Variables

Create `.env` file in `push-notification-system/server/`:

```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=../firebase-setup/service-account-key.json
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/

# Server Configuration
PORT=3001
```

## Step 6: Test Configuration

Run the notification server:
```bash
cd push-notification-system/server
npm install
npm start
```

Visit: http://localhost:3001

You should see:
- ✅ Server Online
- ✅ Firebase Connected

## Next Steps

1. **Integrate with your mobile app** → See `mobile-integration/` folder
2. **Test notifications** → Use the web interface
3. **Deploy server** → Use your preferred hosting service

## Troubleshooting

### Firebase Not Connected
- Check service account key path
- Verify JSON file is valid
- Ensure project ID matches

### Permission Errors
- Make sure service account has FCM permissions
- Check file permissions on service account key

### Android Integration Issues
- Verify `google-services.json` is in correct location
- Check package name matches Firebase configuration
- Ensure Google Services plugin is applied

## Security Best Practices

1. **Keep service account key secure**
2. **Use environment variables for sensitive data**
3. **Enable Firebase App Check for production**
4. **Implement proper authentication for your notification API**
5. **Use HTTPS in production**
