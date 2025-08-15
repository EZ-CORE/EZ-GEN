# 🚀 EZ-GEN Push Notification System

## 📱 Complete Firebase Cloud Messaging Solution

A standalone push notification server for mobile apps with web testing interface.

### ✨ Features
- ✅ Firebase Cloud Messaging (FCM) integration
- ✅ Easy testing web interface  
- ✅ Deep linking support
- ✅ Android & iOS support
- ✅ Custom notification payloads
- ✅ Batch notifications
- ✅ Scheduled notifications

### 🚀 Quick Start

#### 1. Clone Repository
```bash
git clone https://github.com/ez-gen/ez-gen-push-notifications.git
cd ez-gen-push-notifications
```

#### 2. Firebase Setup
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Download service account key
3. Place it at: `firebase-setup/service-account-key.json`

#### 3. Install Dependencies
```bash
cd server
npm install
```

#### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Firebase settings
```

#### 5. Start Server
```bash
npm start
```

#### 6. Open Testing Interface
Visit: http://localhost:3002

### 📁 Project Structure
```
ez-gen-push-notifications/
├── README.md
├── QUICK-START.md
├── firebase-setup/
│   ├── firebase-setup.md
│   └── service-account-key.json     # Your Firebase key (do not commit)
├── mobile-integration/
│   └── ionic-capacitor-integration.md
├── server/
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   └── public/                      # Web testing interface
└── templates/
    └── sample-notifications.json
```

### 🔧 Environment Variables
```env
PORT=3002
FIREBASE_SERVICE_ACCOUNT_PATH=../firebase-setup/service-account-key.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 🌐 API Endpoints
- `POST /api/send-notification` - Send single notification
- `POST /api/send-batch` - Send batch notifications  
- `POST /api/schedule-notification` - Schedule notification
- `GET /api/health` - Health check

### 📚 Documentation
- [Firebase Setup Guide](firebase-setup/firebase-setup.md)
- [Mobile Integration](mobile-integration/ionic-capacitor-integration.md)
- [Quick Start Guide](QUICK-START.md)

### 🤝 Integration with EZ-GEN
This system is designed to work with [EZ-GEN App Generator](https://github.com/ez-gen/ez-gen-core) but can be used standalone with any mobile app.

### 📄 License
MIT License

### 🏢 Organization
Part of the [EZ-GEN Organization](https://github.com/ez-gen) - Easy mobile app generation tools.
