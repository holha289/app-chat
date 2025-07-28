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

# 2. Xoá toàn bộ cache Gradle và thư mục build Android
$gradleUserCache = "$env:USERPROFILE\.gradle"
$androidGradle = "android\.gradle"
$androidAppBuild = "android\app\build"

Write-Host "🧹 Xoá cache Gradle và thư mục build..."
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$gradleUserCache"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$androidGradle"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "$androidAppBuild"

# 3. Xoá node_modules, lock files và thư mục .expo nếu có
Write-Host "🧼 Dọn node_modules, .expo, lock files..."
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "node_modules"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue ".expo"
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue ".expo-shared"
Remove-Item -Force -ErrorAction SilentlyContinue "package-lock.json"
Remove-Item -Force -ErrorAction SilentlyContinue "yarn.lock"

# 4. Cài lại npm packages
Write-Host "📦 Cài lại npm packages..."
npm install

# 5. Tùy chọn: dùng Expo prebuild nếu có app.json
if (Test-Path "./app.json") {
    Write-Host "🔧 Phát hiện app.json → chạy expo prebuild --clean"
    npx expo prebuild --clean --no-install
} else {
    Write-Host "⚠️ Không phát hiện app.json → bỏ qua bước prebuild"
}

# 6. Dọn cache Metro bundler
Write-Host "🧠 Reset cache Metro bundler..."
Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "react-native", "start", "--reset-cache" -PassThru | ForEach-Object {
    Start-Sleep -Seconds 5
    $_.Kill()
}


# 7. Build lại Android
Write-Host "📲 Build lại app Android..."
npx react-native run-android

Write-Host "✅ Reset & Build hoàn tất!" -ForegroundColor Green
