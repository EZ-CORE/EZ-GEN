package io.ionic.starter;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

/**
 * Helper class for handling notification permissions on Android 13+
 * This addresses issues where Capacitor's permission requests don't trigger the dialog
 */
public class NotificationPermissionHelper {
    private static final String TAG = "NotificationPermissionHelper";
    private static final int NOTIFICATION_PERMISSION_REQUEST_CODE = 1001;
    
    /**
     * Check if notification permission is granted
     */
    public static boolean hasNotificationPermission(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return ContextCompat.checkSelfPermission(context, 
                Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }
        // For Android < 13, notifications are enabled by default
        return true;
    }
    
    /**
     * Request notification permission if not already granted
     */
    public static void requestNotificationPermission(Activity activity) {
        Log.d(TAG, "Requesting notification permission...");
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (!hasNotificationPermission(activity)) {
                Log.d(TAG, "Permission not granted, showing system dialog...");
                ActivityCompat.requestPermissions(activity, 
                    new String[]{Manifest.permission.POST_NOTIFICATIONS}, 
                    NOTIFICATION_PERMISSION_REQUEST_CODE);
            } else {
                Log.d(TAG, "Notification permission already granted");
            }
        } else {
            Log.d(TAG, "Android version < 13, notification permission not required");
        }
    }
    
    /**
     * Check if we should show permission rationale
     */
    public static boolean shouldShowPermissionRationale(Activity activity) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return ActivityCompat.shouldShowRequestPermissionRationale(activity, 
                Manifest.permission.POST_NOTIFICATIONS);
        }
        return false;
    }
    
    /**
     * Handle permission request result
     */
    public static void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == NOTIFICATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d(TAG, "Notification permission granted by user");
            } else {
                Log.d(TAG, "Notification permission denied by user");
            }
        }
    }
}
