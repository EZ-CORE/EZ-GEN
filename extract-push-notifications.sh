#!/bin/bash

# Script to extract push-notification-system to separate repository
# Run this from the EZ-GEN root directory

set -e

echo "🚀 Extracting EZ-GEN Push Notification System to separate repo..."

# Create new directory for the extracted repo
NEW_REPO_DIR="../ez-gen-push-notifications"
CURRENT_DIR=$(pwd)

# Create new repository directory
echo "📁 Creating new repository directory..."
mkdir -p "$NEW_REPO_DIR"
cd "$NEW_REPO_DIR"

# Initialize git repository
echo "🔧 Initializing Git repository..."
git init
echo "# EZ-GEN Push Notification System" > README.md

# Copy files from original repo
echo "📋 Copying push-notification-system files..."
cp -r "$CURRENT_DIR/push-notification-system/"* .

# Replace the old README with the new one
cp README-NEW.md README.md
rm README-NEW.md

# Create .gitignore for the new repo
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json

# Environment variables
.env
.env.local
.env.development
.env.test
.env.production

# Firebase service account key (IMPORTANT: Never commit this!)
firebase-setup/service-account-key.json
firebase-setup/service-account.json

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
.tmp/
temp/

# Build outputs
dist/
build/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Firebase cache
.firebase/
EOF

# Create initial commit
echo "📦 Creating initial commit..."
git add .
git commit -m "feat: Initial commit - EZ-GEN Push Notification System

- Complete Firebase Cloud Messaging server
- Web testing interface  
- Mobile integration documentation
- Environment configuration
- API endpoints for notifications"

echo ""
echo "✅ Push notification system extracted successfully!"
echo ""
echo "📍 New repository location: $NEW_REPO_DIR"
echo ""
echo "🚀 Next steps:"
echo "1. Create GitHub organization: ez-gen"
echo "2. Create repository: ez-gen-push-notifications"
echo "3. Add remote origin:"
echo "   cd $NEW_REPO_DIR"
echo "   git remote add origin https://github.com/ez-gen/ez-gen-push-notifications.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Update main EZ-GEN repo to remove push-notification-system folder"
echo ""

cd "$CURRENT_DIR"
