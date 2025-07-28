# #!/bin/bash

# echo "🧹 Đang dọn dẹp dự án React Native Android..."

# # Xóa thư mục build
# Remove-Item -Recurse -Force android/app/build
# Remove-Item -Recurse -Force android/.gradle
# Remove-Item -Recurse -Force .gradle
# Remove-Item -Recurse -Force node_modules
# Remove-Item -Recurse -Force .expo
# Remove-Item -Recurse -Force .expo-shared

# # Xóa cache hệ thống Gradle (chỉ khi muốn thật sạch)
# echo "📦 Xóa cache hệ thống Gradle (~/.gradle/caches)..."
# Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches" -ErrorAction SilentlyContinue

# # Xóa lock file nếu cần
# Remove-Item -Force yarn.lock package-lock.json

# # Cài lại package
# echo "📦 Cài lại dependencies..."
# npm install

# # Clean gradle
# cd android
# ./gradlew clean --no-daemon
# cd ..

# # Build lại app
# echo "🚀 Build lại app Android..."
# npx react-native run-android

# echo "✅ Hoàn tất!"
# reset-react-native.ps1

Write-Host "🚀 Bắt đầu reset môi trường React Native & Gradle..." -ForegroundColor Cyan

# 1. Kill tất cả tiến trình Gradle và Node
Write-Host "🧨 Kill node.exe & java.exe nếu còn sống..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Xoá toàn bộ cache Gradle
$gradleUserCache = "$env:USERPROFILE\.gradle"
$androidGradle = "android\.gradle"
$androidAppBuild = "android\app\build"

Write-Host "🧹 Xoá cache Gradle..."
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$gradleUserCache"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$androidGradle"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$androidAppBuild"

# 3. Xoá node_modules & lock files
Write-Host "🧼 Dọn node_modules, lock files..."
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "node_modules"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue ".expo"
Remove-Item -Force -ErrorAction SilentlyContinue "package-lock.json"
Remove-Item -Force -ErrorAction SilentlyContinue "yarn.lock"

# 4. Cài lại package
Write-Host "📦 Cài lại npm packages..."
npm install

# 5. Reset Metro bundler cache
# Write-Host "🧠 Reset cache Metro bundler..."
# npx react-native start --reset-cache


# 6. Build lại app
Write-Host "📲 Build lại app Android..."
npx react-native run-android

Write-Host "✅ Reset hoàn tất!" -ForegroundColor Green
