package io.ionic.starter;

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
        
        // Request notification permission for Android 13+
        requestNotificationPermissionIfNeeded();
        
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
            
            // Enhanced caching for faster loading
            webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
            webSettings.setDatabaseEnabled(true);
            webSettings.setDomStorageEnabled(true);
            
            // Enable additional caching mechanisms
            String cacheDirPath = getCacheDir().getAbsolutePath();
            webSettings.setDatabasePath(cacheDirPath);
            
            // Optimize loading performance
            webSettings.setRenderPriority(WebSettings.RenderPriority.HIGH);
            webSettings.setLoadWithOverviewMode(true);
            webSettings.setUseWideViewPort(true);
            
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
            
            android.util.Log.d("MainActivity", "🔔 Notification clicked!");
            android.util.Log.d("MainActivity", "Deep link: " + deepLink);
            android.util.Log.d("MainActivity", "Web link: " + webLink);
            android.util.Log.d("MainActivity", "Click action: " + clickAction);
            android.util.Log.d("MainActivity", "Navigation type: " + navigationType);
            android.util.Log.d("MainActivity", "Target URL: " + targetUrl);
            
            // Handle in-app navigation (navigate within webview)
            if ("in-app".equals(navigationType) && targetUrl != null && !targetUrl.isEmpty()) {
                android.util.Log.d("MainActivity", "📱 Navigating in-app to: " + targetUrl);
                navigateInWebView(targetUrl);
                return;
            }
            
            // If there's a web link, navigate within the webview (in-app)
            if (webLink != null && !webLink.isEmpty()) {
                android.util.Log.d("MainActivity", "🌐 Navigating in-app to web link: " + webLink);
                navigateInWebView(webLink);
                return;
            }
            
            if (deepLink != null && !deepLink.isEmpty()) {
                android.util.Log.d("MainActivity", "🌐 Navigating in-app to deep link: " + deepLink);
                if (deepLink.startsWith("http")) {
                    navigateInWebView(deepLink);
                } else {
                    // Handle internal app routes - could pass to Capacitor
                    android.util.Log.d("MainActivity", "📱 Internal route: " + deepLink);
                }
            }
        }
    }
    
    private void navigateInWebView(String url) {
        Bridge bridge = this.getBridge();
        if (bridge != null && bridge.getWebView() != null) {
            // Use runOnUiThread to ensure we're on the main thread
            runOnUiThread(() -> {
                try {
                    // Navigate within the webview instead of opening external browser
                    bridge.getWebView().loadUrl(url);
                    android.util.Log.d("MainActivity", "✅ Successfully navigated to: " + url);
                } catch (Exception e) {
                    android.util.Log.e("MainActivity", "❌ Failed to navigate in webview: " + e.getMessage());
                }
            });
        } else {
            android.util.Log.e("MainActivity", "❌ WebView not available for navigation");
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
    
    /**
     * Request notification permission for Android 13+ if not already granted
     */
    private void requestNotificationPermissionIfNeeded() {
        Log.d("MainActivity", "Checking notification permission status...");
        
        // Use a delay to ensure the activity is fully loaded
        new android.os.Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                if (!NotificationPermissionHelper.hasNotificationPermission(MainActivity.this)) {
                    Log.d("MainActivity", "Notification permission not granted, requesting...");
                    NotificationPermissionHelper.requestNotificationPermission(MainActivity.this);
                } else {
                    Log.d("MainActivity", "Notification permission already granted");
                }
            }
        }, 2000); // 2 second delay to ensure activity is ready
    }
    
    /**
     * Handle permission request results
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        NotificationPermissionHelper.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }
}
