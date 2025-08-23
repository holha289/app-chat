param(
  [switch]$DeepClean
)

$ErrorActionPreference = 'Stop'

function Stop-IfRunning($name) {
  Get-Process $name -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

function SafeRemove($path) {
  if (Test-Path $path) {
    Write-Host "Remove: $path"
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $path
  }
}

Write-Host "Start reset for React Native & Gradle..."

# 1) Kill processes
Write-Host "Kill node.exe & java.exe if any..."
Stop-IfRunning node
Stop-IfRunning java

# 2) Clean Android build & Gradle
$androidGradle   = Join-Path -Path "android" -ChildPath ".gradle"
$androidAppBuild = Join-Path -Path "android\app" -ChildPath "build"
$gradleUserCache = Join-Path -Path $env:USERPROFILE -ChildPath ".gradle\caches"

Write-Host "Clean Android build..."
SafeRemove $androidAppBuild
SafeRemove $androidGradle

if ($DeepClean) {
  Write-Host "Deep clean Gradle user cache (~/.gradle/caches)..."
  SafeRemove $gradleUserCache
} else {
  Write-Host "Skip ~/.gradle/caches (pass -DeepClean to remove)"
}

# 3) Clean node_modules, .expo, locks
Write-Host "Clean node_modules, .expo, lock files..."
# SafeRemove "node_modules"
SafeRemove ".expo"
SafeRemove ".expo-shared"
if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue }
if (Test-Path "yarn.lock")        { Remove-Item -Force "yarn.lock"        -ErrorAction SilentlyContinue }

# 4) Reinstall packages
Write-Host "Install npm packages..."
if (Test-Path "package-lock.json") {
  npm ci
} else {
  npm install
}

# 5) Expo prebuild if app.json exists
if (Test-Path "./app.json") {
  Write-Host "Found app.json -> expo prebuild --clean --no-install"
  Start-Process -NoNewWindow -Wait `
    -FilePath "$env:ComSpec" `
    -ArgumentList @("/c","npx","expo","prebuild","--clean","--no-install")
} else {
  Write-Host "No app.json -> skip prebuild"
}

# 6) Reset Metro cache
Write-Host "Reset Metro cache..."
$metro = Start-Process -PassThru -WindowStyle Hidden `
  -FilePath "$env:ComSpec" `
  -ArgumentList @("/c","npx","react-native","start","--reset-cache","--port","8081")
Start-Sleep -Seconds 5
if ($metro -and !$metro.HasExited) { $metro.Kill() }

# 7) Gradle clean
Write-Host "Gradle clean..."
Push-Location android
try {
  if (Test-Path ".\gradlew.bat") {
    .\gradlew.bat clean --no-daemon
  } else {
    throw "Missing android\gradlew.bat - open Android project to generate Gradle wrapper."
  }
} finally {
  Pop-Location
}

# 8) Build Android
Write-Host "Build Android..."
Start-Process -NoNewWindow -Wait `
  -FilePath "$env:ComSpec" `
  -ArgumentList @("/c","npx","react-native","run-android")

Write-Host "Done!" -ForegroundColor Green
