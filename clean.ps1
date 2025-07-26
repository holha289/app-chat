#!/bin/bash

echo "🧹 Đang dọn dẹp dự án React Native Android..."

# Xóa thư mục build
rm -rf android/app/build
rm -rf android/.gradle
rm -rf .gradle
rm -rf node_modules
rm -rf .expo
rm -rf .expo-shared

# Xóa cache hệ thống Gradle (chỉ khi muốn thật sạch)
echo "📦 Xóa cache hệ thống Gradle (~/.gradle/caches)..."
rm -rf ~/.gradle/caches

# Xóa lock file nếu cần
rm -f yarn.lock package-lock.json

# Cài lại package
echo "📦 Cài lại dependencies..."
npm install

# Clean gradle
cd android
./gradlew clean --no-daemon
cd ..

# Build lại app
echo "🚀 Build lại app Android..."
npx react-native run-android --variant=debug

echo "✅ Hoàn tất!"
