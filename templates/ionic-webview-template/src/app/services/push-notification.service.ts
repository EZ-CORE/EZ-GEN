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
      console.log('📱 Android Target SDK: 35 (Android 14) - POST_NOTIFICATIONS required');
      
      // Extended delay to ensure full Capacitor initialization
      console.log('⏳ Waiting for Capacitor to fully initialize...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check if we're on a supported platform
      if (typeof window === 'undefined') {
        console.log('⚠️ Window not available, skipping push notifications');
        return;
      }
      
      // Verify Capacitor is available
      if (typeof (window as any).Capacitor === 'undefined') {
        console.log('⚠️ Capacitor not available, skipping push notifications');
        return;
      }
      
      // Always setup listeners first - don't depend on permissions
      this.setupListeners();
      
      // Wait for device ready state
      console.log('📱 Checking device ready state...');
      await this.waitForDeviceReady();
      
      // Advanced permission request with multiple strategies
      console.log('🎯 Starting advanced permission request sequence...');
      
      // Strategy 1: Check current permission status first
      try {
        console.log('📋 Strategy 1: Checking current permission status...');
        
        // Try to check permissions first (but don't rely on it)
        let currentStatus;
        try {
          currentStatus = await PushNotifications.checkPermissions();
          console.log('� Current permission status:', JSON.stringify(currentStatus));
        } catch (checkError) {
          console.log('⚠️ Cannot check current permissions (this is common):', checkError);
          currentStatus = null;
        }
        
        // If permissions are already granted, just register
        if (currentStatus?.receive === 'granted') {
          console.log('✅ Permissions already granted, registering...');
          await PushNotifications.register();
          console.log('✅ Registration successful with existing permissions');
          return;
        }
        
        // Strategy 2: Direct registration first (often triggers permission dialog)
        console.log('🎯 Strategy 2: Direct registration attempt...');
        try {
          await PushNotifications.register();
          console.log('✅ Direct registration successful');
          return;
        } catch (directError) {
          console.log('❌ Direct registration failed:', directError);
          console.log('🔄 Continuing to explicit permission request...');
        }
        
        // Strategy 3: Explicit permission request
        console.log('📋 Strategy 3: Explicit permission request...');
        const permission = await PushNotifications.requestPermissions();
        console.log('� Explicit permission result:', JSON.stringify(permission));
        
        if (permission?.receive === 'granted') {
          console.log('✅ Permission explicitly granted!');
          try {
            await PushNotifications.register();
            console.log('✅ Registration successful after explicit permission');
          } catch (regError) {
            console.error('❌ Registration failed after permission grant:', regError);
            this.tryDelayedRegistration();
          }
        } else if (permission?.receive === 'denied') {
          console.log('❌ Permission explicitly denied by user');
          console.log('� User can enable notifications in: Settings > Apps > [App Name] > Notifications');
          this.tryDelayedRegistration(); // Still try, sometimes works
        } else {
          console.log('⚠️ Permission status unclear or prompt not shown:', permission);
          console.log('🔄 Attempting delayed registration as fallback...');
          this.tryDelayedRegistration();
        }
        
      } catch (permissionError) {
        console.error('❌ Permission sequence failed:', permissionError);
        console.log('🔄 Trying fallback registration methods...');
        this.tryDelayedRegistration();
      }
      
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

  private async waitForDeviceReady(): Promise<void> {
    return new Promise((resolve) => {
      // Check if device is already ready
      if (document.readyState === 'complete') {
        console.log('📱 Device already ready');
        resolve();
        return;
      }
      
      // Wait for document ready
      const checkReady = () => {
        if (document.readyState === 'complete') {
          console.log('📱 Device now ready');
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      
      checkReady();
      
      // Timeout after 10 seconds
      setTimeout(() => {
        console.log('⏰ Device ready timeout, proceeding anyway');
        resolve();
      }, 10000);
    });
  }

  private tryDelayedRegistration(): void {
    console.log('🔄 Starting delayed registration attempts...');
    
    // Multiple delayed attempts with increasing intervals
    const delays = [1000, 3000, 5000, 10000];
    
    delays.forEach((delay, index) => {
      setTimeout(async () => {
        try {
          console.log(`🎲 Delayed registration attempt ${index + 1} (${delay}ms)...`);
          await PushNotifications.register();
          console.log(`✅ Delayed registration attempt ${index + 1} succeeded!`);
          console.log('⏳ Waiting for FCM token...');
        } catch (fallbackError) {
          console.log(`❌ Delayed registration attempt ${index + 1} failed:`, fallbackError);
          
          if (index === delays.length - 1) {
            console.log('🏁 All registration attempts completed');
            console.log('💡 If no FCM token appears, check:');
            console.log('   1. Device Settings > Apps > [App Name] > Notifications');
            console.log('   2. Android notification permission in system settings');
            console.log('   3. Google Play Services availability');
            console.log('   4. Firebase configuration files');
          }
        }
      }, delay);
    });
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

  // Manual permission request method - can be called from UI
  async requestNotificationPermissions(): Promise<void> {
    console.log('🔔 Manual notification permission request triggered...');
    
    try {
      // Show user what's happening
      console.log('📱 Requesting notification permissions manually...');
      console.log('🤖 Android 13+: This should show the system permission dialog');
      
      // Try the most direct approach first
      const permission = await PushNotifications.requestPermissions();
      console.log('🔐 Manual permission result:', JSON.stringify(permission));
      
      if (permission?.receive === 'granted') {
        console.log('✅ Permission granted! Registering for notifications...');
        await PushNotifications.register();
        console.log('✅ Registration complete - waiting for FCM token...');
      } else {
        console.log('❌ Permission not granted:', permission);
        console.log('🔄 Attempting registration anyway (might still work)...');
        try {
          await PushNotifications.register();
          console.log('✅ Registration succeeded despite permission status');
        } catch (regError) {
          console.error('❌ Registration failed:', regError);
          console.log('💡 Please enable notifications in device Settings > Apps > [App Name]');
        }
      }
    } catch (error) {
      console.error('❌ Manual permission request failed:', error);
      console.log('💡 Trying direct registration as fallback...');
      try {
        await PushNotifications.register();
        console.log('✅ Direct registration fallback succeeded');
      } catch (fallbackError) {
        console.error('❌ All methods failed:', fallbackError);
      }
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
      
      // Instead of using window.location.href which can crash the app,
      // we'll just log the navigation and let the webview handle it naturally
      console.log('📱 Navigation requested to:', url);
      console.log('✅ Navigation logged - WebView will handle URL loading');
      
      // Don't actually navigate - this prevents crashes
      // The webview app is designed to stay on the current domain
      
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
