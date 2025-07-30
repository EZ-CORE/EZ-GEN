import { Component, OnInit } from '@angular/core';
import { IonApp, IonContent, IonButton, IonIcon, IonText, IonSpinner } from '@ionic/angular/standalone';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { globe, refresh, home, eye } from 'ionicons/icons';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonContent, IonButton, IonIcon, IonText, IonSpinner, CommonModule],
})
export class AppComponent implements OnInit {
  websiteUrl = 'https://example.com';
  safeUrl: SafeResourceUrl;
  isNative = false;
  loadingError = false;
  isLoading = true;
  showContent = false;
  private clickCount = 0;
  
  constructor(
    private sanitizer: DomSanitizer,
    private pushNotificationService: PushNotificationService
  ) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.websiteUrl);
    this.isNative = Capacitor.isNativePlatform();
    
    // Add icons
    addIcons({ globe, refresh, home, eye });
  }

  async ngOnInit() {
    console.log('🚀 AppComponent ngOnInit started');
    console.log('📱 Platform check - isNative:', this.isNative);
    console.log('📱 Capacitor platform info:', Capacitor.getPlatform());
    
    // Initialize push notifications in background (non-blocking)
    console.log('⚙️ Starting push notifications initialization in background...');
    this.initializePushNotifications(); // Remove await to make it non-blocking
    
    // Initialize push notifications on native platforms
    if (this.isNative) {
      console.log('📱 Native platform detected, proceeding with native setup');
      
      // On native platforms, redirect to the website URL directly
      // This uses the native WebView to load the website fullscreen
      await this.loadInNativeWebView();
    } else {
      console.log('🌐 Web platform detected, showing iframe');
      // On web platforms, show iframe fallback
      this.showContent = true;
      this.checkUrlAccessibility();
    }
    
    console.log('✅ AppComponent ngOnInit completed');
  }

  async initializePushNotifications() {
    try {
      console.log('🚀 App Component: Initializing push notifications for Timeless app...');
      console.log('📱 Platform check - isNative:', this.isNative);
      
      // Initialize push notifications
      console.log('⚙️ Calling pushNotificationService.initializePushNotifications()...');
      await this.pushNotificationService.initializePushNotifications();
      
      console.log('🎧 Setting up listeners...');
      this.pushNotificationService.setupListeners();
      
      console.log('📡 Subscribing to topic: timeless-updates');
      this.pushNotificationService.subscribeToTopic('timeless-updates');
      
      console.log('✅ Push notifications initialization completed successfully');
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
      console.error('❌ Error details:', JSON.stringify(error));
    }
  }

  async loadInNativeWebView() {
    try {
      console.log('🌐 Starting native WebView load process...');
      
      // Reduced wait time - push notifications can initialize in background
      console.log('⏰ Waiting 2 seconds for essential initialization...');
      setTimeout(() => {
        console.log('🚀 Now redirecting to website for fullscreen experience...');
        // Use Capacitor's native WebView to navigate to the website (fullscreen)
        window.location.href = this.websiteUrl;
      }, 2000); // Reduced from 8 seconds to 2 seconds
    } catch (error) {
      console.error('Error loading website in native WebView:', error);
      this.loadingError = true;
      this.isLoading = false;
      this.showContent = true;
    }
  }

  async checkUrlAccessibility() {
    // Don't perform accessibility check for web platform iframe
    // The iframe will handle errors automatically
  }

  async openInExternalBrowser() {
    if (this.isNative) {
      await Browser.open({ url: this.websiteUrl });
    } else {
      window.open(this.websiteUrl, '_blank');
    }
  }

  async openInInAppBrowser() {
    if (this.isNative) {
      await Browser.open({ 
        url: this.websiteUrl,
        windowName: '_self'  // Opens in the same window/app
      });
    } else {
      // For web, redirect to the website
      window.location.href = this.websiteUrl;
    }
  }

  async reloadWebsite() {
    this.loadingError = false;
    this.isLoading = true;
    this.showContent = false;
    
    if (this.isNative) {
      await this.loadInNativeWebView();
    } else {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = iframe.src; // Reload iframe
      }
      this.showContent = true;
    }
  }

  onIframeError() {
    console.error('Iframe failed to load website');
    this.loadingError = true;
    this.isLoading = false;
  }

  onIframeLoad() {
    console.log('Iframe loaded successfully');
    this.loadingError = false;
    this.isLoading = false;
    // Add loaded class for smooth transition
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.classList.add('loaded');
    }
  }

  // Hidden method to show FCM token - can be triggered by hidden button
  showFCMToken() {
    this.pushNotificationService.showFCMToken();
  }

  // Hidden click handler - tap loading spinner 5 times to show FCM token
  onLoadingClick() {
    this.clickCount++;
    console.log(`Loading clicked ${this.clickCount} times`);
    
    if (this.clickCount >= 5) {
      this.showFCMToken();
      this.clickCount = 0; // Reset counter
    }
    
    // Reset counter after 3 seconds if not enough clicks
    setTimeout(() => {
      if (this.clickCount < 5) {
        this.clickCount = 0;
      }
    }, 3000);
  }
}
