#!/bin/bash

set -e

echo "📦 Checking for Gradle installation..."

if ! command -v gradle &> /dev/null; then
  echo "❌ Gradle not found. Installing..."
  sudo apt update
  sudo apt install -y gradle
else
  echo "✅ Gradle is already installed: $(gradle -v | grep Gradle)"
fi

echo "🔍 Searching for generated Android apps missing gradlew..."

GENERATED_DIR="$HOME/EZ-GEN/generated-apps"

if [ ! -d "$GENERATED_DIR" ]; then
  echo "❌ Generated apps directory not found at: $GENERATED_DIR"
  exit 1
fi

for project_dir in "$GENERATED_DIR"/*; do
  if [ -d "$project_dir/android/app" ]; then
    cd "$project_dir/android"
    if [ ! -f "./gradlew" ]; then
      echo "🛠️ Adding gradle wrapper to: $project_dir"
      gradle wrapper
      chmod +x gradlew
    else
      echo "✅ gradlew already exists in: $project_dir"
    fi
  fi
done

echo "✅ Gradle setup complete for all projects."
