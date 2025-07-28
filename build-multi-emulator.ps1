# ==========================
# ⚙️ Build cho tất cả emulator đang chạy
# ==========================

Write-Host "🚀 Bắt đầu quá trình build React Native cho nhiều emulator..." -ForegroundColor Cyan

# BƯỚC 1: Kill tiến trình node/java để tránh conflict
Write-Host "🧨 Kill tiến trình node & java..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force

# BƯỚC 2: Reset Metro Bundler cache bằng cách né npx.ps1
Write-Host "🧠 Reset Metro Bundler cache..."
Start-Process cmd -ArgumentList "/c npx react-native start --reset-cache"
Start-Sleep -Seconds 5  # Cho metro bundler khởi động

# BƯỚC 3: Build APK bằng Gradle
Write-Host "🏗️ Build APK bằng Gradle..."
Push-Location android
.\gradlew assembleDebug

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build thất bại! Dừng lại tại đây." -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# BƯỚC 4: Tìm emulator đang chạy
Write-Host "🔍 Tìm thiết bị emulator đang chạy..."
$devices = & adb devices | Select-String "emulator-[0-9]+"

if ($devices.Count -eq 0) {
    Write-Host "⚠️ Không tìm thấy emulator nào đang chạy!" -ForegroundColor Yellow
    exit 1
}

# BƯỚC 5: Cài APK lên từng emulator
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
foreach ($line in $devices) {
    $match = [regex]::Match($line.ToString(), "emulator-[0-9]+")
    if ($match.Success) {
        $deviceId = $match.Value
        Write-Host "📲 Cài APK lên $deviceId..."
        adb -s $deviceId install -r $apkPath
    }
}

Write-Host "✅ Hoàn tất! App đã được cài lên tất cả emulator đang chạy." -ForegroundColor Green
