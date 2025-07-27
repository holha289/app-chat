#!/bin/bash

echo "🧹 Đang dọn dẹp dự án React Native Android..."

# Xóa thư mục build
Remove-Item -Recurse -Force android/app/build
Remove-Item -Recurse -Force android/.gradle
Remove-Item -Recurse -Force .gradle
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force .expo-shared

# Xóa cache hệ thống Gradle (chỉ khi muốn thật sạch)
echo "📦 Xóa cache hệ thống Gradle (~/.gradle/caches)..."
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches" -ErrorAction SilentlyContinue

# Xóa lock file nếu cần
Remove-Item -Force yarn.lock package-lock.json

# Cài lại package
echo "📦 Cài lại dependencies..."
npm install

# Clean gradle
cd android
./gradlew clean --no-daemon
cd ..

# Build lại app
echo "🚀 Build lại app Android..."
npx react-native run-android

echo "✅ Hoàn tất!"
