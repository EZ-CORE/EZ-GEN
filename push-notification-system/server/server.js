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
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
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
      deepLink
    } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({ 
        error: 'Missing required fields: token, title, body' 
      });
    }

    // Prepare notification payload
    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
        imageUrl: imageUrl || undefined
      },
      data: {
        ...data,
        deepLink: deepLink || '',
        clickAction: clickAction || 'OPEN_APP',
        timestamp: Date.now().toString()
      },
      android: {
        notification: {
          sound: sound,
          clickAction: clickAction || 'OPEN_APP',
          channelId: 'default',
          priority: 'high'
        },
        data: {
          ...data,
          deepLink: deepLink || ''
        }
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

    const response = await admin.messaging().send(message);
    
    console.log('✅ Notification sent successfully:', response);
    
    res.json({
      success: true,
      messageId: response,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error sending notification:', error);
    res.status(500).json({
      error: 'Failed to send notification',
      details: error.message
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

    const message = {
      notification: {
        title: title,
        body: body,
        imageUrl: imageUrl || undefined
      },
      data: {
        ...data,
        timestamp: Date.now().toString()
      },
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
      deepLink
    } = req.body;

    if (!topic || !title || !body) {
      return res.status(400).json({ 
        error: 'Missing required fields: topic, title, body' 
      });
    }

    const message = {
      topic: topic,
      notification: {
        title: title,
        body: body,
        imageUrl: imageUrl || undefined
      },
      data: {
        ...data,
        deepLink: deepLink || '',
        timestamp: Date.now().toString()
      },
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
