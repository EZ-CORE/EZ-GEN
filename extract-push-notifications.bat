@echo off
REM Script to extract push-notification-system to separate repository
REM Run this from the EZ-GEN root directory

echo 🚀 Extracting EZ-GEN Push Notification System to separate repo...

REM Create new directory for the extracted repo
set "NEW_REPO_DIR=..\ez-gen-push-notifications"
set "CURRENT_DIR=%cd%"

REM Create new repository directory
echo 📁 Creating new repository directory...
if not exist "%NEW_REPO_DIR%" mkdir "%NEW_REPO_DIR%"
cd /d "%NEW_REPO_DIR%"

REM Initialize git repository
echo 🔧 Initializing Git repository...
git init
echo # EZ-GEN Push Notification System > README.md

REM Copy files from original repo
echo 📋 Copying push-notification-system files...
xcopy /s /e "%CURRENT_DIR%\push-notification-system\*" . /y

REM Replace the old README with the new one
copy README-NEW.md README.md
del README-NEW.md

REM Create .gitignore for the new repo
echo 📝 Creating .gitignore...
(
echo # Node.js
echo node_modules/
echo npm-debug.log*
echo yarn-debug.log*
echo yarn-error.log*
echo package-lock.json
echo.
echo # Environment variables
echo .env
echo .env.local
echo .env.development
echo .env.test
echo .env.production
echo.
echo # Firebase service account key ^(IMPORTANT: Never commit this!^)
echo firebase-setup/service-account-key.json
echo firebase-setup/service-account.json
echo.
echo # Logs
echo logs/
echo *.log
echo.
echo # Runtime data
echo pids/
echo *.pid
echo *.seed
echo *.pid.lock
echo.
echo # Coverage directory used by tools like istanbul
echo coverage/
echo.
echo # Temporary folders
echo .tmp/
echo temp/
echo.
echo # Build outputs
echo dist/
echo build/
echo.
echo # IDE files
echo .vscode/
echo .idea/
echo *.swp
echo *.swo
echo.
echo # OS generated files
echo .DS_Store
echo .DS_Store?
echo ._*
echo .Spotlight-V100
echo .Trashes
echo ehthumbs.db
echo Thumbs.db
echo.
echo # Firebase cache
echo .firebase/
) > .gitignore

REM Create initial commit
echo 📦 Creating initial commit...
git add .
git commit -m "feat: Initial commit - EZ-GEN Push Notification System" -m "" -m "- Complete Firebase Cloud Messaging server" -m "- Web testing interface" -m "- Mobile integration documentation" -m "- Environment configuration" -m "- API endpoints for notifications"

echo.
echo ✅ Push notification system extracted successfully!
echo.
echo 📍 New repository location: %NEW_REPO_DIR%
echo.
echo 🚀 Next steps:
echo 1. Create GitHub organization: ez-gen
echo 2. Create repository: ez-gen-push-notifications
echo 3. Add remote origin:
echo    cd %NEW_REPO_DIR%
echo    git remote add origin https://github.com/ez-gen/ez-gen-push-notifications.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 4. Update main EZ-GEN repo to remove push-notification-system folder
echo.

cd /d "%CURRENT_DIR%"
pause
