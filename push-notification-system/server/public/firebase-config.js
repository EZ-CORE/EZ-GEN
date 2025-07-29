// Firebase Web Configuration for Browser FCM Token Generation

// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAx-_0N4gAvQa7QtnJN5jCdyazs_kNHM-Y",
  authDomain: "ez-gen-notification.firebaseapp.com",
  projectId: "ez-gen-notification",
  storageBucket: "ez-gen-notification.firebasestorage.app",
  messagingSenderId: "23037188092",
  appId: "1:23037188092:web:your-web-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

// Function to get FCM token
window.getFCMToken = async function() {
  try {
    console.log('🔄 Requesting FCM token...');
    
    // Get registration token
    const currentToken = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY' // We'll need to generate this
    });

    if (currentToken) {
      console.log('✅ FCM Token generated successfully!');
      console.log('📱 FCM Token:', currentToken);
      
      // Also display it on the page
      const tokenDisplay = document.getElementById('web-fcm-token');
      if (tokenDisplay) {
        tokenDisplay.textContent = currentToken;
        tokenDisplay.style.wordBreak = 'break-all';
        tokenDisplay.style.padding = '10px';
        tokenDisplay.style.backgroundColor = '#f0f8ff';
        tokenDisplay.style.border = '1px solid #ccc';
      }
      
      return currentToken;
    } else {
      console.log('❌ No registration token available.');
      console.log('📝 Request permission for notifications first.');
      return null;
    }
  } catch (err) {
    console.error('❌ An error occurred while retrieving token:', err);
    return null;
  }
};

// Function to request notification permission
window.requestNotificationPermission = async function() {
  try {
    const permission = await Notification.requestPermission();
    console.log('🔔 Notification permission:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted.');
      return true;
    } else {
      console.log('❌ Notification permission denied.');
      return false;
    }
  } catch (error) {
    console.error('❌ Error requesting permission:', error);
    return false;
  }
};

// Handle incoming messages when the app is in the foreground
onMessage(messaging, (payload) => {
  console.log('✅ Message received in foreground:', payload);
  
  // Display the notification
  if (payload.notification) {
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: payload.notification.icon || '/favicon.ico'
    });
  }
});

// Make functions available globally
window.messaging = messaging;
window.firebaseApp = app;

console.log('🚀 Firebase Web SDK loaded and ready!');
console.log('📱 To get FCM token, run: getFCMToken()');
console.log('🔔 To request permission, run: requestNotificationPermission()');
