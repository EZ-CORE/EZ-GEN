package com.ezassist.timeless;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.WebSettings;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Create notification channel for Android 8.0+
        createNotificationChannel();
        
        // Handle notification click
        handleNotificationIntent(getIntent());
        
        // Configure window insets to respect system UI (status bar, navigation bar, notch)
        setupWindowInsets();
        
        // Configure webview settings for better external website loading
        Bridge bridge = this.getBridge();
        if (bridge != null && bridge.getWebView() != null) {
            WebSettings webSettings = bridge.getWebView().getSettings();
            
            // Enable mixed content (HTTP on HTTPS)
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            
            // Enable DOM storage
            webSettings.setDomStorageEnabled(true);
            
            // Enable database storage
            webSettings.setDatabaseEnabled(true);
            
            // Enable JavaScript (should already be enabled)
            webSettings.setJavaScriptEnabled(true);
            
            // Allow file access
            webSettings.setAllowFileAccess(true);
            webSettings.setAllowContentAccess(true);
            
            // Enable zooming
            webSettings.setSupportZoom(true);
            webSettings.setBuiltInZoomControls(true);
            webSettings.setDisplayZoomControls(false);
            
            // Improve loading performance
            webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
            // Note: setAppCacheEnabled is deprecated in API 33+
            
            // Set user agent to help with compatibility
            String userAgent = webSettings.getUserAgentString();
            webSettings.setUserAgentString(userAgent + " CapacitorWebView");
        }
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleNotificationIntent(intent);
    }
    
    private void handleNotificationIntent(Intent intent) {
        if (intent != null && intent.getExtras() != null) {
            String deepLink = intent.getStringExtra("deepLink");
            String webLink = intent.getStringExtra("webLink");
            String clickAction = intent.getStringExtra("clickAction");
            String navigationType = intent.getStringExtra("navigationType");
            String targetUrl = intent.getStringExtra("targetUrl");
            String industry = intent.getStringExtra("industry");
            
            android.util.Log.d("MainActivity", "🔔 Notification clicked!");
            android.util.Log.d("MainActivity", "Deep link: " + deepLink);
            android.util.Log.d("MainActivity", "Web link: " + webLink);
            android.util.Log.d("MainActivity", "Click action: " + clickAction);
            android.util.Log.d("MainActivity", "Navigation type: " + navigationType);
            android.util.Log.d("MainActivity", "Target URL: " + targetUrl);
            android.util.Log.d("MainActivity", "Industry: " + industry);
            
            // Handle in-app navigation (navigate within the webview)
            if ("in-app".equals(navigationType) && targetUrl != null && !targetUrl.isEmpty()) {
                android.util.Log.d("MainActivity", "📱 In-app navigation to: " + targetUrl);
                
                // Navigate to the target URL within the webview
                Bridge bridge = this.getBridge();
                if (bridge != null && bridge.getWebView() != null) {
                    // Post to UI thread to ensure webview is ready
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                // Load the target URL in the webview
                                bridge.getWebView().loadUrl(targetUrl);
                                android.util.Log.d("MainActivity", "✅ Successfully navigated to: " + targetUrl);
                            } catch (Exception e) {
                                android.util.Log.e("MainActivity", "❌ Failed to navigate in webview: " + e.getMessage());
                            }
                        }
                    });
                }
                return;
            }
            
            // If there's a web link and no deep link, open the web link in browser
            if (webLink != null && !webLink.isEmpty() && (deepLink == null || deepLink.isEmpty())) {
                android.util.Log.d("MainActivity", "🌐 Opening web link in browser: " + webLink);
                try {
                    Intent webIntent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(webLink));
                    webIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(webIntent);
                    return;
                } catch (Exception e) {
                    android.util.Log.e("MainActivity", "Failed to open web link: " + e.getMessage());
                }
            }
            
            if (deepLink != null && !deepLink.isEmpty()) {
                // Handle other deep links
                android.util.Log.d("MainActivity", "🔗 Deep link navigation: " + deepLink);
            }
        }
    }
    
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Default";
            String description = "Default notification channel";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel("default", name, importance);
            channel.setDescription(description);
            channel.enableVibration(true);
            channel.setShowBadge(true);
            
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }
    
     private void setupWindowInsets() {
        View decorView = getWindow().getDecorView();

        // Set up window insets listener to handle system UI overlays with newer AndroidX libraries
        ViewCompat.setOnApplyWindowInsetsListener(decorView, (v, windowInsets) -> {
            // For newer AndroidX Core libraries
            // Get system bars insets (status bar, navigation bar, etc.)
            androidx.core.graphics.Insets systemBars = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
            androidx.core.graphics.Insets displayCutout = windowInsets.getInsets(WindowInsetsCompat.Type.displayCutout());

            // Apply padding to the root view to avoid overlap with system UI
            int topInset = Math.max(systemBars.top, displayCutout.top);
            int bottomInset = Math.max(systemBars.bottom, displayCutout.bottom);
            int leftInset = Math.max(systemBars.left, displayCutout.left);
            int rightInset = Math.max(systemBars.right, displayCutout.right);

            v.setPadding(leftInset, topInset, rightInset, bottomInset);

            return WindowInsetsCompat.CONSUMED;
        });

        // Enable edge-to-edge display while respecting system UI
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ (API 30+)
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                // Show status bar but make it transparent
                controller.show(WindowInsets.Type.statusBars());
            }
        } else {
            // Android 10 and below
            decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            );
        }
    }
}
