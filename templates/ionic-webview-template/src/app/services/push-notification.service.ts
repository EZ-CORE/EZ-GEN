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
      
      // Add a small delay to ensure Capacitor is fully initialized
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if we're on a supported platform
      if (typeof window === 'undefined') {
        console.log('⚠️ Window not available, skipping push notifications');
        return;
      }
      
      // Request permission to use push notifications with additional error handling
      console.log('📋 Requesting push notification permissions...');
      let permission;
      
      try {
        permission = await PushNotifications.requestPermissions();
      } catch (permissionError) {
        console.error('❌ Error requesting permissions:', permissionError);
        console.log('⚠️ Falling back to setup listeners only');
        this.setupListeners();
        return;
      }
      
      console.log('🔐 Permission result:', permission);
      
      if (permission && permission.receive === 'granted') {
        console.log('✅ Permission granted, registering for push notifications...');
        
        try {
          // Register with Apple / Google to receive push via APNS/FCM
          await PushNotifications.register();
          console.log('✅ Push notifications registered successfully');
          console.log('⏳ Waiting for FCM token...');
        } catch (registerError) {
          console.error('❌ Error during registration:', registerError);
        }
      } else {
        console.log('❌ Push notification permission denied or unavailable:', permission);
      }
      
      // Always setup listeners regardless of permission status
      this.setupListeners();
      
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
      console.error('❌ Error details:', JSON.stringify(error));
      
      // Still setup listeners in case of error
      try {
        this.setupListeners();
      } catch (setupError) {
        console.error('❌ Error setting up listeners:', setupError);
      }
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
      // Handle deep linking - removed console.log to prevent alert popups
      this.handleNotificationTap(notification);
    });
    
    console.log('✅ All push notification listeners set up');
  }

  // Method to get the stored FCM token
  getFCMToken(): string | null {
    return this.fcmToken;
  }

  // Method to show FCM token in console (for debugging)
  showFCMToken(): void {
    if (this.fcmToken) {
      console.log('📱 FCM Token:', this.fcmToken);
    } else {
      console.log('❌ FCM Token not yet available. Please wait for initialization to complete.');
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
    console.log('📬 New notification received:', notification.title, '-', notification.body);
    
    // You can show a toast, modal, or update your app's UI
    // Removed alert to prevent interruption
  }

  private async handleNotificationTap(notification: ActionPerformed) {
    console.log('🔔 Notification tapped, handling navigation...');
    console.log('📋 Notification data:', notification.notification.data);
    
    // Get navigation data from notification
    const deepLink = notification.notification.data?.deepLink;
    const clickAction = notification.notification.data?.clickAction;
    const navigationType = notification.notification.data?.navigationType;
    const targetUrl = notification.notification.data?.targetUrl;
    const webLink = notification.notification.data?.webLink;
    
    console.log('🎯 Navigation details:');
    console.log('  - Deep link:', deepLink);
    console.log('  - Click action:', clickAction);
    console.log('  - Navigation type:', navigationType);
    console.log('  - Target URL:', targetUrl);
    console.log('  - Web link:', webLink);
    
    // Priority 1: Handle in-app navigation (stay within webview)
    if (navigationType === 'in-app' && targetUrl) {
      console.log('📱 In-app navigation to:', targetUrl);
      this.navigateInApp(targetUrl);
      return;
    }
    
    // Priority 2: Handle web link navigation (stay within webview)
    if (webLink && webLink.trim() !== '') {
      console.log('🌐 Web link navigation to:', webLink);
      this.navigateInApp(webLink);
      return;
    }
    
    // Priority 3: Handle traditional deep links
    if (deepLink && deepLink.trim() !== '') {
      console.log('🔗 Deep link navigation to:', deepLink);
      if (deepLink.startsWith('http')) {
        this.navigateInApp(deepLink);
      } else {
        // Use Angular router for internal navigation
        try {
          this.router.navigate([deepLink]);
          console.log('✅ Angular router navigation successful');
        } catch (error) {
          console.error('❌ Angular router navigation failed:', error);
        }
      }
      return;
    }
    
    console.log('⚠️ No valid navigation data found in notification');
  }
  
  private navigateInApp(url: string) {
    try {
      console.log('🚀 Navigating in-app to:', url);
      
      // For native platforms, the MainActivity will handle the navigation
      // For web platforms, use window.location
      if (window.location) {
        window.location.href = url;
        console.log('✅ In-app navigation successful');
      } else {
        console.error('❌ Window.location not available');
      }
    } catch (error) {
      console.error('❌ In-app navigation failed:', error);
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
