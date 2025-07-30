# 📱 Ionic/Capacitor Push Notification Integration

## Step 1: Install Dependencies

```bash
# Install Capacitor Push Notifications plugin
npm install @capacitor/push-notifications

# Sync with native platforms
npx cap sync
```

## Step 2: Configure Android

### Add to `android/app/build.gradle`:
```gradle
dependencies {
    // ... existing dependencies
    implementation 'com.google.firebase:firebase-messaging:23.0.0'
}

// Add at the bottom
apply plugin: 'com.google.gms.google-services'
```

### Add to `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        // ... existing dependencies
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

### Place `google-services.json` in `android/app/`

## Step 3: Configure iOS

### Add to `ios/App/App/Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

### Place `GoogleService-Info.plist` in `ios/App/App/`

## Step 4: Implement in Your Ionic App

### Create `src/services/push-notification.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  
  constructor(private router: Router) {}

  async initializePushNotifications() {
    try {
      // Request permission to use push notifications
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
        
        console.log('✅ Push notifications registered successfully');
      } else {
        console.log('❌ Push notification permission denied');
      }
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
    }
  }

  setupListeners() {
    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('📱 FCM Token:', token.value);
      
      // Send token to your server for storage
      this.sendTokenToServer(token.value);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('❌ Registration error:', error.error);
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
  }

  private async sendTokenToServer(token: string) {
    try {
      // Send token to your server
      const response = await fetch('http://localhost:3002/api/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          platform: this.getPlatform(),
          userId: this.getCurrentUserId(), // Implement this based on your auth system
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
    // You can show a local notification or update your app's UI
    console.log('Handling foreground notification:', notification);
    console.log('New notification received:', notification.title, '-', notification.body);
    
    // Example: Show a toast or modal instead of alert
    // this.toastController.create({...}).then(toast => toast.present());
  }

  private handleNotificationTap(notification: ActionPerformed) {
    console.log('Notification tapped with data:', notification.notification.data);
    
    // Handle deep linking based on notification data
    const deepLink = notification.notification.data?.deepLink;
    const clickAction = notification.notification.data?.clickAction;
    const navigationType = notification.notification.data?.navigationType;
    const targetUrl = notification.notification.data?.targetUrl;
    const webLink = notification.notification.data?.webLink;
    
    // Handle in-app navigation (navigate within webview)
    if (navigationType === 'in-app' && targetUrl) {
      console.log('In-app navigation to:', targetUrl);
      window.location.href = targetUrl;
      return;
    }
    
    // Handle web link navigation
    if (webLink && !navigationType) {
      console.log('Web link navigation to:', webLink);
      window.location.href = webLink;
      return;
    }
    
    // Handle traditional deep links
    if (deepLink) {
      if (deepLink.startsWith('http')) {
        window.location.href = deepLink;
      } else {
        // Use Angular router for internal navigation
        this.router.navigate([deepLink]);
      }
    } else if (clickAction === 'OPEN_APP') {
      // Just open the app (default behavior)
      this.router.navigate(['/home']);
    }
  }

  private getPlatform(): string {
    // Implement platform detection
    return 'android'; // or 'ios'
  }

  private getCurrentUserId(): string {
    // Implement user ID retrieval from your auth system
    return 'anonymous';
  }

  // Subscribe to a topic
  async subscribeToTopic(topic: string) {
    try {
      // You'll need to call your server to subscribe the current token to a topic
      const response = await fetch('http://localhost:3002/api/subscribe-to-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens: [await this.getCurrentToken()],
          topic: topic
        })
      });
      
      if (response.ok) {
        console.log(\`✅ Subscribed to topic: \${topic}\`);
      }
    } catch (error) {
      console.error('❌ Error subscribing to topic:', error);
    }
  }

  private async getCurrentToken(): Promise<string> {
    // Get the current FCM token
    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token: Token) => {
        resolve(token.value);
      });
    });
  }
}
```

## Step 5: Initialize in Your App

### Update `src/app/app.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  
  constructor(
    private platform: Platform,
    private pushNotificationService: PushNotificationService
  ) {}

  async ngOnInit() {
    await this.platform.ready();
    
    // Initialize push notifications
    await this.pushNotificationService.initializePushNotifications();
    this.pushNotificationService.setupListeners();
    
    // Subscribe to general topic (optional)
    // await this.pushNotificationService.subscribeToTopic('general');
  }
}
```

## Step 6: Deep Linking Setup

### Configure routing in `src/app/app-routing.module.ts`:

```typescript
const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('./welcome/welcome.module').then(m => m.WelcomePageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsPageModule)
  }
];
```

## Step 7: Testing

1. Build and run your app:
```bash
npx cap build android
npx cap run android
```

2. Check console for FCM token
3. Copy the token and test in the notification center
4. Send a notification with deep link
5. Tap notification and verify app opens to correct page

## Step 8: Handle Notification Channels (Android)

### Add to your main activity or application class:

```java
// Create notification channel for Android 8.0+
private void createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        String channelId = "default";
        String channelName = "Default Notifications";
        String channelDescription = "Default notification channel";
        int importance = NotificationManager.IMPORTANCE_HIGH;
        
        NotificationChannel channel = new NotificationChannel(channelId, channelName, importance);
        channel.setDescription(channelDescription);
        
        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        notificationManager.createNotificationChannel(channel);
    }
}
```

## Troubleshooting

### No Token Received
- Check Firebase configuration
- Verify app is running on physical device (not emulator)
- Check platform-specific setup

### Notifications Not Appearing
- Verify notification permissions are granted
- Check notification channel setup (Android)
- Test with device in different states (foreground/background)

### Deep Links Not Working
- Verify routing configuration
- Check notification payload data
- Test deep link paths manually

## Production Considerations

1. **Store tokens in your database** with user associations
2. **Handle token refresh** - tokens can change
3. **Implement proper error handling**
4. **Use HTTPS for server communication**
5. **Add analytics** to track notification engagement
6. **Implement notification preferences** for users
