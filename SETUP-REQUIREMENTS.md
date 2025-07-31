# Required Manual Setup Files

After cloning this repository, you need to manually create/configure these files that are excluded from Git for security reasons:

## 🔥 Firebase Configuration (REQUIRED)

### 1. Android Configuration
**File:** `templates/ionic-webview-template/android/app/google-services.json`

**How to get:**
1. Go to https://console.firebase.google.com
2. Create or select your project
3. Add Android app with package ID: `com.ezassist.timeless` (or your chosen package)
4. Download `google-services.json`
5. Place in the path above

### 2. iOS Configuration
**File:** `templates/ionic-webview-template/ios/App/GoogleService-Info.plist`

**How to get:**
1. In same Firebase project, add iOS app
2. Download `GoogleService-Info.plist`
3. Place in the path above

### 3. Firebase Admin SDK (for push notification server)
**File:** `push-notification-system/firebase-setup/service-account-key.json`

**How to get:**
1. In Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Rename it to `service-account-key.json`
5. Place in `push-notification-system/firebase-setup/` directory

## 🔧 Environment Variables

### Create `.env` file
**File:** `.env` (in project root)

**Template:**
```bash
PORT=3002
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_SENDER_ID=123456789
FIREBASE_SERVICE_ACCOUNT_PATH=./push-notification-system/firebase-setup/service-account-key.json
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
```

## 📁 Required Directories

Create these directories in project root:
```bash
mkdir uploads
mkdir generated-apps
mkdir temp
mkdir android-signing (optional, for production builds)
mkdir ios-certificates (optional, for iOS builds)
mkdir -p push-notification-system/firebase-setup
```

## 🔐 Android Signing (Optional, for production)

### Generate Release Keystore
```bash
keytool -genkey -v -keystore android-signing/release-key.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
```

### Create keystore.properties
**File:** `android-signing/keystore.properties`
```properties
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=release
storeFile=release-key.keystore
```

## ✅ Verification

After setup, your project structure should look like:
```
EZ-GEN/
├── .env                    ✅ (your environment variables)
├── uploads/                ✅ (empty directory)
├── generated-apps/         ✅ (empty directory)
├── temp/                   ✅ (empty directory)
├── templates/ionic-webview-template/
│   ├── android/app/google-services.json  ✅
│   └── ios/App/GoogleService-Info.plist  ✅
├── push-notification-system/
│   └── firebase-setup/
│       └── service-account-key.json  ✅
└── android-signing/        ✅ (optional)
    ├── release-key.keystore
    └── keystore.properties
```

## 🚨 Security Note

**Never commit these files to Git:**
- Firebase configuration files contain API keys
- Keystores contain signing certificates
- Environment files may contain secrets

These files are already included in `.gitignore` for your protection.
