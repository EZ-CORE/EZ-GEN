import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private fcmToken: string | null = null;
  
  constructor(private router: Router) {}

  async initializePushNotifications() {
    try {
      console.log('🔧 Starting push notification initialization...');
      
      // Request permission to use push notifications
      console.log('📋 Requesting push notification permissions...');
      const permission = await PushNotifications.requestPermissions();
      
      console.log('🔐 Permission result:', permission);
      
      if (permission.receive === 'granted') {
        console.log('✅ Permission granted, registering for push notifications...');
        
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
        
        console.log('✅ Push notifications registered successfully');
        console.log('⏳ Waiting for FCM token...');
      } else {
        console.log('❌ Push notification permission denied:', permission);
      }
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
      console.error('❌ Error details:', JSON.stringify(error));
    }
  }

  setupListeners() {
    console.log('🎧 Setting up push notification listeners...');
    
    // Set up app state listener
    App.addListener('appStateChange', (state) => {
      console.log('📱 App state changed:', state);
      if (state.isActive) {
        console.log('✅ App is now active/foreground');
      }
    });
    
    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('🎉 REGISTRATION SUCCESS!');
      console.log('🔥 FCM Token received:', token.value);
      
      // Store the token silently
      this.fcmToken = token.value;
      
      // Send token to your server for storage
      this.sendTokenToServer(token.value);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('❌ REGISTRATION ERROR:', error.error);
      console.error('❌ Full error object:', JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('📬 Notification received (foreground):', notification);
      
      // Show local notification or update UI
      this.handleForegroundNotification(notification);
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('🔔 Notification tapped:', notification);
      
      // Handle deep linking
      this.handleNotificationTap(notification);
    });
    
    console.log('✅ All push notification listeners set up');
  }

  // Method to get the stored FCM token
  getFCMToken(): string | null {
    return this.fcmToken;
  }

  // Method to show FCM token in alert (for hidden button)
  showFCMToken(): void {
    if (this.fcmToken) {
      alert(`FCM Token:\n\n${this.fcmToken}`);
    } else {
      alert('FCM Token not yet available. Please wait for initialization to complete.');
    }
  }

  private async sendTokenToServer(token: string) {
    try {
      // Send token to your notification server
      const response = await fetch('http://localhost:3002/api/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          platform: 'android', // or detect platform
          userId: 'timeless-user', // Replace with actual user ID
          appName: 'Timeless',
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        console.log('✅ Token sent to server successfully');
      } else {
        console.error('❌ Failed to send token to server');
      }
    } catch (error) {
      console.error('❌ Error sending token to server:', error);
    }
  }

  private handleForegroundNotification(notification: PushNotificationSchema) {
    console.log('📱 Handling foreground notification:', notification);
    
    // You can show a toast, modal, or update your app's UI
    // For now, we'll just log it
    alert(`📱 New notification: ${notification.title}\n${notification.body}`);
  }

  private async handleNotificationTap(notification: ActionPerformed) {
    console.log('🔔 Notification tapped with full data:', JSON.stringify(notification, null, 2));
    
    // Handle deep linking based on notification data
    const deepLink = notification.notification.data?.deepLink;
    const clickAction = notification.notification.data?.clickAction;
    
    console.log('🔀 Deep link:', deepLink);
    console.log('🎯 Click action:', clickAction);
    console.log('📱 Notification tapped - handling navigation');
    
    // Handle navigation immediately without alert
    if (deepLink && deepLink.trim() !== '') {
      console.log('🌐 Opening deep link:', deepLink);
      window.location.href = deepLink;
    } else {
      console.log('🏠 Reloading main app website');
      window.location.reload();
    }
  }

  // Subscribe to a topic
  async subscribeToTopic(topic: string) {
    try {
      const currentToken = await this.getCurrentToken();
      if (!currentToken) {
        console.error('❌ No FCM token available');
        return;
      }

      const response = await fetch('http://localhost:3002/api/subscribe-to-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens: [currentToken],
          topic: topic
        })
      });
      
      if (response.ok) {
        console.log(`✅ Subscribed to topic: ${topic}`);
      }
    } catch (error) {
      console.error('❌ Error subscribing to topic:', error);
    }
  }

  private async getCurrentToken(): Promise<string | null> {
    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token: Token) => {
        resolve(token.value);
      });
      
      // If already registered, the listener might not fire
      // In a real app, you'd store the token and retrieve it
      setTimeout(() => resolve(null), 1000);
    });
  }
}
