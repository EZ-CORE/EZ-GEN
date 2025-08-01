# EZ-GEN WSL Development Setup Guide

## 🎉 Your EZ-GEN project is now set up in WSL!

### 📋 Current Status
✅ Git repository initialized  
✅ SSH keys generated  
✅ Node.js 20 and npm working  
✅ Java 21 installed  
✅ WSL-compatible line endings fixed  
✅ Initial commit created  

### 🔑 Next Steps Required

#### 1. Add SSH Key to GitHub
Your SSH public key:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF2AiBH8ePEG8wdSluz2dujtRbjUPxsBpE5qGxbrAc9F shafschwd@users.noreply.github.com
```

**To add it:**
1. Go to https://github.com/settings/ssh/new
2. Title: "WSL EZ-GEN Development"
3. Paste the key above
4. Click "Add SSH key"

#### 2. Push Your Code to GitHub
Once SSH key is added, run in WSL:
```bash
cd ~/EZ-GEN
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_ed25519
git push -u origin main
```

### 🚀 Development Commands

#### WSL Terminal Commands:
```bash
# Navigate to project
cd ~/EZ-GEN

# Start development server
npm start

# Check git status
git status

# Make changes and commit
git add .
git commit -m "Your commit message"
git push

# Pull latest changes
git pull
```

### 🔧 Development Workflow

#### Starting Development:
1. Open WSL terminal
2. `cd ~/EZ-GEN`
3. `npm start` - starts the server on http://localhost:3000

#### Making Changes:
1. Edit files in VS Code (Windows side)
2. Test in WSL: `npm start`
3. Commit: `git add . && git commit -m "description"`
4. Push: `git push`

#### Building APKs in WSL:
- Server automatically builds APKs when apps are generated
- WSL compatibility fixes applied (line endings, permissions)
- Android SDK setup may be needed for full builds

### 🛠️ Environment Details

**Paths:**
- Windows: `C:\Users\azwad\Desktop\EZ-GEN`
- WSL: `~/EZ-GEN` (equivalent to `/home/azwad/EZ-GEN`)

**Tools:**
- Node.js: v20.19.4
- npm: 10.8.2
- Java: OpenJDK 21
- Git: 2.43.0

### 🔄 Syncing Between Windows and WSL

Files are automatically synced between:
- Windows: `C:\Users\azwad\Desktop\EZ-GEN`
- WSL: `~/EZ-GEN`

Edit in VS Code on Windows, test/git in WSL terminal.

### 📱 Android Development

For full Android builds, you may need:
```bash
# Set Android SDK path (if needed)
export ANDROID_HOME=~/Android/Sdk
echo 'export ANDROID_HOME=~/Android/Sdk' >> ~/.bashrc
```

### 🎯 Quick Start

1. **Add SSH key to GitHub** (see above)
2. **Push code**: `cd ~/EZ-GEN && git push -u origin main`
3. **Start developing**: `npm start`
4. **Test app generation** at http://localhost:3000

You're all set for cross-platform development! 🚀
