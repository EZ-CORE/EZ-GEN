# Script to clean up main EZ-GEN repo after extracting push notifications
# Run this AFTER you've successfully created the separate push-notifications repo

echo "🧹 Cleaning up main EZ-GEN repo..."

# Remove push-notification-system references from .env.example
sed -i '/FIREBASE_SERVICE_ACCOUNT_PATH.*push-notification-system/d' .env.example

# Remove push-notification-system references from .gitignore  
sed -i '/push-notification-system/d' .gitignore

# Remove push-notification-system folder
rm -rf push-notification-system/

# Remove the temporary files created for extraction
rm -f extract-push-notifications.sh
rm -f extract-push-notifications.bat
rm -f cleanup-main-repo.sh
rm -f GITHUB-ORG-SETUP.md

echo "✅ Main repository cleaned up!"
echo ""
echo "📝 Manual updates needed:"
echo "1. Update DOCS/FILE-COMPARISON.md to remove push-notification-system references"
echo "2. Update any documentation that references the push notification system"
echo "3. Update README.md to mention the separate push-notifications repo"
echo ""
echo "📄 Suggested README addition:"
echo "## 🔔 Push Notifications"
echo "For push notification functionality, see the separate repository:"
echo "[EZ-GEN Push Notifications](https://github.com/ez-gen/ez-gen-push-notifications)"
