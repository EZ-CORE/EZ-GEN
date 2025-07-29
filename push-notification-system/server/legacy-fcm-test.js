const axios = require('axios');

// Legacy FCM Server Key approach
// This method uses the legacy server key instead of service account

const LEGACY_SERVER_KEY = 'AIzaSyAx-_0N4gAvQa7QtnJN5jCdyazs_kNHM-Y'; // From google-services.json
const FCM_TOKEN = 'fcoCWMX-TEOf5n9__Btgaj:APA91bFM8srX7--F1_Mm8tWJwV4IFnQAb0SFGAlPI7k-HzKsDAiodGb8yBCIF_ngVVjO4YkJVTpsSkRSkaLAdhGXlESokxSwyCrNI5z7XMVH1V9ezSnhqTZboI8ospm9FM3qQkhG0JGq';

async function sendLegacyFCMNotification() {
  try {
    const response = await axios.post('https://fcm.googleapis.com/fcm/send', {
      to: FCM_TOKEN,
      notification: {
        title: 'Legacy FCM Test',
        body: 'Testing with legacy server key approach',
        icon: 'fcm_push_icon'
      },
      data: {
        test: 'true',
        method: 'legacy'
      }
    }, {
      headers: {
        'Authorization': `key=${LEGACY_SERVER_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Legacy FCM notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Legacy FCM notification failed:', error.response?.data || error.message);
    return null;
  }
}

// Test the legacy approach
sendLegacyFCMNotification();
