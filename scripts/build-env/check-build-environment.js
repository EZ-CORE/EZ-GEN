#!/usr/bin/env node

/**
 * Build Environment Checker for EZ-GEN
 * This script checks if all required tools are installed for Android app building
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔍 EZ-GEN Build Environment Checker');
console.log('====================================');

async function checkCommand(command, args = ['--version'], description) {
  return new Promise((resolve) => {
    console.log(`Checking ${description}...`);
    
    const process = spawn(command, args, { stdio: 'pipe' });
    let output = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        const version = output.split('\n')[0].trim();
        console.log(`✅ ${description}: ${version}`);
        resolve({ success: true, version });
      } else {
        console.log(`❌ ${description}: Not found or not working`);
        resolve({ success: false, error: output });
      }
    });
    
    process.on('error', (error) => {
      console.log(`❌ ${description}: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
  });
}

async function checkEnvironmentVariable(name, description, required = true) {
  const value = process.env[name];
  if (value) {
    if (fs.existsSync(value)) {
      console.log(`✅ ${description}: ${value}`);
      return { success: true, value };
    } else {
      console.log(`❌ ${description}: Path does not exist - ${value}`);
      return { success: false, error: 'Path does not exist' };
    }
  } else {
    if (required) {
      console.log(`❌ ${description}: Environment variable ${name} not set`);
      return { success: false, error: 'Not set' };
    } else {
      console.log(`⚠️  ${description}: Environment variable ${name} not set (optional)`);
      return { success: false, error: 'Not set', optional: true };
    }
  }
}

async function main() {
  const results = {
    node: await checkCommand('node', ['--version'], 'Node.js'),
    npm: await checkCommand('npm', ['--version'], 'npm'),
    java: await checkCommand('java', ['--version'], 'Java'),
    keytool: await checkCommand('keytool', ['-help'], 'Java Keytool'),
    gradle: await checkCommand('gradle', ['--version'], 'Gradle (optional, wrapper preferred)'),
  };
  
  console.log('\n📁 Environment Variables:');
  const envResults = {
    androidHome: await checkEnvironmentVariable('ANDROID_HOME', 'Android SDK Home'),
    androidSdkRoot: await checkEnvironmentVariable('ANDROID_SDK_ROOT', 'Android SDK Root', false),
    javaHome: await checkEnvironmentVariable('JAVA_HOME', 'Java Home', false),
  };
  
  console.log('\n🔧 System Information:');
  console.log(`OS: ${os.type()} ${os.release()}`);
  console.log(`Architecture: ${os.arch()}`);
  console.log(`Platform: ${process.platform}`);
  
  console.log('\n📋 Summary:');
  const allSuccess = Object.values(results).every(r => r.success) && 
                    (envResults.androidHome.success || envResults.androidSdkRoot.success);
  
  if (allSuccess) {
    console.log('✅ All required tools are installed and configured!');
    console.log('🚀 You should be able to build Android apps successfully.');
  } else {
    console.log('❌ Some required tools are missing or misconfigured.');
    console.log('\n🛠️  Recommended fixes:');
    
    if (!results.node.success) {
      console.log('• Install Node.js from https://nodejs.org/');
    }
    
    if (!results.java.success) {
      console.log('• Install Java 11 or 17 (recommended: OpenJDK)');
      console.log('  - Windows: Download from https://adoptium.net/');
      console.log('  - Linux: sudo apt install openjdk-17-jdk');
      console.log('  - macOS: brew install openjdk@17');
    }
    
    if (!results.keytool.success) {
      console.log('• Keytool should come with Java. Reinstall Java if missing.');
    }
    
    if (!envResults.androidHome.success && !envResults.androidSdkRoot.success) {
      console.log('• Install Android SDK:');
      console.log('  - Download Android Studio from https://developer.android.com/studio');
      console.log('  - Or install SDK tools only');
      console.log('  - Set ANDROID_HOME or ANDROID_SDK_ROOT environment variable');
      console.log('  - Example paths:');
      console.log('    Windows: C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk');
      console.log('    Linux: /home/YourName/Android/Sdk');
      console.log('    macOS: /Users/YourName/Library/Android/sdk');
    }
    
    if (!envResults.javaHome.success) {
      console.log('• Set JAVA_HOME environment variable (optional but recommended)');
    }
    
    console.log('\n💡 After installing missing tools, restart your terminal and run this check again.');
  }
  
  console.log('\n📝 For more detailed setup instructions, check the DOCS/ folder in your project.');
}

main().catch(console.error);
