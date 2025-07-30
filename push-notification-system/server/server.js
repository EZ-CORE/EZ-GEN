const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

function initializeFirebase() {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                               path.join(__dirname, '..', 'firebase-setup', 'service-account-key.json');
    
    const serviceAccount = require(serviceAccountPath);
    
    // Ensure project ID is explicitly set
    console.log('🔍 Service Account Project ID:', serviceAccount.project_id);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,  // Explicitly set project ID
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log('✅ Project ID set to:', serviceAccount.project_id);
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    console.log('📝 Please ensure your Firebase service account key is properly configured');
  }
}

initializeFirebase();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    firebase: firebaseInitialized,
    timestamp: new Date().toISOString()
  });
});

// Verify Firebase project details
app.get('/api/firebase-info', async (req, res) => {
  if (!firebaseInitialized) {
    return res.status(500).json({ 
      error: 'Firebase not initialized' 
    });
  }

  try {
    const projectId = admin.app().options.projectId;
    const app = admin.app();
    
    // Test Firebase Messaging permissions
    let messagingPermissions = 'Unknown';
    try {
      // Try to access Firebase Messaging service
      const messaging = admin.messaging();
      messagingPermissions = 'Available';
    } catch (permError) {
      messagingPermissions = `Error: ${permError.message}`;
    }
    
    res.json({
      success: true,
      projectId: projectId,
      serviceAccount: app.options.credential.projectId || 'Unknown',
      messagingPermissions: messagingPermissions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get Firebase info',
      details: error.message
    });
  }
});

// Send notification to a single device
app.post('/api/send-notification', async (req, res) => {
  if (!firebaseInitialized) {
    return res.status(500).json({ 
      error: 'Firebase not initialized',
      message: 'Please configure Firebase service account'
    });
  }

  try {
    const { 
      token, 
      title, 
      body, 
      data = {},
      imageUrl,
      sound = 'default',
      badge,
      clickAction,
      deepLink,
      webLink
    } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({ 
        error: 'Missing required fields: token, title, body' 
      });
    }

    // Helper function to ensure all data values are strings (Firebase requirement)
    const stringifyData = (obj) => {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = String(value);
      }
      return result;
    };

    // Prepare notification payload
    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
        imageUrl: imageUrl || undefined
      },
      data: stringifyData({
        ...data,
        deepLink: deepLink || '',
        webLink: webLink || '',
        clickAction: clickAction || 'OPEN_APP',
        timestamp: Date.now().toString()
      }),
      android: {
        notification: {
          sound: sound,
          channelId: 'default',
          priority: 'high',
          tag: 'timeless_notification'
        },
        data: stringifyData({
          ...data,
          deepLink: deepLink || '',
          webLink: webLink || '',
          click_action: 'OPEN_APP',
          timestamp: Date.now().toString()
        })
      },
      apns: {
        payload: {
          aps: {
            sound: sound,
            badge: badge || undefined,
            'mutable-content': 1,
            category: clickAction || 'OPEN_APP'
          }
        },
        fcm_options: {
          image: imageUrl || undefined
        }
      }
    };

    console.log('🔍 Attempting to send notification...');
    console.log('🔍 Project ID:', admin.app().options.projectId);
    console.log('🔍 Token (first 50 chars):', token.substring(0, 50) + '...');
    console.log('🔍 Message payload:', JSON.stringify(message, null, 2));

    const response = await admin.messaging().send(message);
    
    console.log('✅ Notification sent successfully:', response);
    
    res.json({
      success: true,
      messageId: response,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error sending notification:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Full error details:', JSON.stringify(error, null, 2));
    res.status(500).json({
      error: 'Failed to send notification',
      details: error.message,
      errorCode: error.code,
      fullError: error
    });
  }
});

// Send notification to multiple devices
app.post('/api/send-bulk-notifications', async (req, res) => {
  if (!firebaseInitialized) {
    return res.status(500).json({ 
      error: 'Firebase not initialized' 
    });
  }

  try {
    const { 
      tokens, 
      title, 
      body, 
      data = {},
      imageUrl,
      sound = 'default'
    } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ 
        error: 'Missing or invalid tokens array' 
      });
    }

    if (!title || !body) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, body' 
      });
    }

    // Helper function to ensure all data values are strings (Firebase requirement)
    const stringifyData = (obj) => {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = String(value);
      }
      return result;
    };

    const message = {
      notification: {
        title: title,
        body: body,
        imageUrl: imageUrl || undefined
      },
      data: stringifyData({
        ...data,
        timestamp: Date.now().toString()
      }),
      android: {
        notification: {
          sound: sound,
          channelId: 'default',
          priority: 'high'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: sound,
            'mutable-content': 1
          }
        }
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`✅ Bulk notifications sent: ${response.successCount}/${tokens.length}`);
    
    res.json({
      success: true,
      totalCount: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses.map(resp => ({
        success: resp.success,
        messageId: resp.messageId || null,
        error: resp.error ? resp.error.message : null
      }))
    });

  } catch (error) {
    console.error('❌ Error sending bulk notifications:', error);
    res.status(500).json({
      error: 'Failed to send bulk notifications',
      details: error.message
    });
  }
});

// Send notification to topic
app.post('/api/send-topic-notification', async (req, res) => {
  if (!firebaseInitialized) {
    return res.status(500).json({ 
      error: 'Firebase not initialized' 
    });
  }

  try {
    const { 
      topic, 
      title, 
      body, 
      data = {},
      imageUrl,
      sound = 'default',
      deepLink,
      webLink
    } = req.body;

    if (!topic || !title || !body) {
      return res.status(400).json({ 
        error: 'Missing required fields: topic, title, body' 
      });
    }

    // Helper function to ensure all data values are strings (Firebase requirement)
    const stringifyData = (obj) => {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = String(value);
      }
      return result;
    };

    const message = {
      topic: topic,
      notification: {
        title: title,
        body: body,
        imageUrl: imageUrl || undefined
      },
      data: stringifyData({
        ...data,
        deepLink: deepLink || '',
        webLink: webLink || '',
        timestamp: Date.now().toString()
      }),
      android: {
        notification: {
          sound: sound,
          channelId: 'default',
          priority: 'high'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: sound,
            'mutable-content': 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    
    console.log('✅ Topic notification sent successfully:', response);
    
    res.json({
      success: true,
      messageId: response,
      topic: topic,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error sending topic notification:', error);
    res.status(500).json({
      error: 'Failed to send topic notification',
      details: error.message
    });
  }
});

// Get FCM token validation
app.post('/api/validate-token', async (req, res) => {
  if (!firebaseInitialized) {
    return res.status(500).json({ 
      error: 'Firebase not initialized' 
    });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Token is required' 
      });
    }

    // Try to send a test message to validate token
    const testMessage = {
      token: token,
      data: {
        test: 'true',
        validation: 'token-check'
      },
      android: {
        priority: 'high'
      }
    };

    await admin.messaging().send(testMessage);
    
    res.json({
      valid: true,
      token: token,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Token validation failed:', error);
    res.json({
      valid: false,
      token: req.body.token,
      error: error.message,
      checkedAt: new Date().toISOString()
    });
  }
});

// Register FCM token from mobile app
app.post('/api/register-token', async (req, res) => {
  try {
    const { token, platform, userId, appName, timestamp } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Token is required' 
      });
    }

    console.log('📱 New FCM token registered:');
    console.log('   Token (first 50 chars):', token.substring(0, 50) + '...');
    console.log('   Platform:', platform || 'unknown');
    console.log('   User ID:', userId || 'unknown');
    console.log('   App:', appName || 'unknown');
    console.log('   Timestamp:', timestamp || new Date().toISOString());

    // Here you would typically save to your database
    // For now, we'll just acknowledge the registration
    
    res.json({
      success: true,
      message: 'Token registered successfully',
      tokenLength: token.length,
      registeredAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error registering token:', error);
    res.status(500).json({
      error: 'Failed to register token',
      details: error.message
    });
  }
});

// Subscribe token to topic
app.post('/api/subscribe-to-topic', async (req, res) => {
  if (!firebaseInitialized) {
    return res.status(500).json({ 
      error: 'Firebase not initialized' 
    });
  }

  try {
    const { tokens, topic } = req.body;

    if (!tokens || !topic) {
      return res.status(400).json({ 
        error: 'Missing required fields: tokens, topic' 
      });
    }

    const tokensArray = Array.isArray(tokens) ? tokens : [tokens];
    const response = await admin.messaging().subscribeToTopic(tokensArray, topic);
    
    console.log(`✅ Subscribed ${response.successCount} tokens to topic: ${topic}`);
    
    res.json({
      success: true,
      topic: topic,
      successCount: response.successCount,
      failureCount: response.failureCount,
      subscribedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error subscribing to topic:', error);
    res.status(500).json({
      error: 'Failed to subscribe to topic',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Push Notification Server running on:');
  console.log(`   http://localhost:${PORT}`);
  console.log('');
  console.log('📱 Features available:');
  console.log('   • Single device notifications');
  console.log('   • Bulk notifications');
  console.log('   • Topic-based notifications');
  console.log('   • Deep link support');
  console.log('   • Testing interface');
  console.log('');
  if (!firebaseInitialized) {
    console.log('⚠️  Warning: Firebase not initialized');
    console.log('   Please configure your Firebase service account key');
  }
});
