package {{PACKAGE_NAME}};

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    
    private static final String TAG = "FCMService";
    private static final String CHANNEL_ID = "default";
    
    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "🔥 Firebase Messaging Service created");
    }
    
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "📬 Message received from: " + remoteMessage.getFrom());
        
        // Check if message contains a notification payload
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "📨 Notification body: " + remoteMessage.getNotification().getBody());
            showNotification(remoteMessage);
        }
        
        // Check if message contains data payload
        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "📋 Message data payload: " + remoteMessage.getData());
        }
    }
    
    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "🔑 New FCM token: " + token);
        // Send token to your server here if needed
    }
    
    private void showNotification(RemoteMessage remoteMessage) {
        // Create intent for app launch with notification data
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        // Add notification data as extras
        if (remoteMessage.getData() != null) {
            for (String key : remoteMessage.getData().keySet()) {
                intent.putExtra(key, remoteMessage.getData().get(key));
                Log.d(TAG, "📋 Adding extra: " + key + " = " + remoteMessage.getData().get(key));
            }
        }
        
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent,
                PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE);
        
        // Build notification
        NotificationCompat.Builder notificationBuilder =
            new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(remoteMessage.getNotification().getTitle())
                .setContentText(remoteMessage.getNotification().getBody())
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_HIGH);
        
        // Handle web link action if present
        String webLink = remoteMessage.getData().get("webLink");
        if (webLink != null && !webLink.isEmpty()) {
            // Create intent for web link that will be handled by MainActivity
            Intent webIntent = new Intent(this, MainActivity.class);
            webIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            webIntent.putExtra("webLink", webLink);
            
            // Add all other data as well
            if (remoteMessage.getData() != null) {
                for (String key : remoteMessage.getData().keySet()) {
                    webIntent.putExtra(key, remoteMessage.getData().get(key));
                }
            }
            
            PendingIntent webPendingIntent = PendingIntent.getActivity(this, 999, webIntent,
                    PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE);
            
            notificationBuilder.setContentIntent(webPendingIntent);
            Log.d(TAG, "🌐 Added web link action: " + webLink);
        }
        
        // Set small icon (you should add this to your resources)
        notificationBuilder.setSmallIcon(android.R.drawable.ic_dialog_info);
        
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        
        // Create notification channel for Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Default Channel",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Default notification channel");
            channel.enableVibration(true);
            channel.setShowBadge(true);
            
            notificationManager.createNotificationChannel(channel);
        }
        
        notificationManager.notify(0, notificationBuilder.build());
        Log.d(TAG, "📱 Notification displayed");
    }
}
