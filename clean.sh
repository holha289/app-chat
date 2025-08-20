#!/usr/bin/env bash
# reset-rn.sh — Reset React Native & Gradle cho Ubuntu/WSL
set -euo pipefail

# ==== Options ====
DEEP_CLEAN=false
PORT=8081
for arg in "$@"; do
  case "$arg" in
    --deep|-d) DEEP_CLEAN=true ;;
    --port=*)  PORT="${arg#*=}" ;;
    *) echo "Usage: $0 [--deep] [--port=8081]"; exit 1 ;;
  esac
done

# ==== Helpers ====
log() { printf "\033[1;34m[INFO]\033[0m %s\n" "$*"; }
warn(){ printf "\033[1;33m[WARN]\033[0m %s\n" "$*"; }
ok()  { printf "\033[1;32m[DONE]\033[0m %s\n" "$*"; }

stop_if_running() {
  # stop by name if exists
  pkill -9 "$1" 2>/dev/null || true
}

safe_rm() {
  local p="$1"
  if [ -e "$p" ]; then
    log "Remove: $p"
    rm -rf -- "$p"
  fi
}

detect_pm() {
  if [ -f "pnpm-lock.yaml" ] || command -v pnpm >/dev/null 2>&1; then
    echo "pnpm"
  elif [ -f "yarn.lock" ] || command -v yarn >/dev/null 2>&1; then
    echo "yarn"
  else
    echo "npm"
  fi
}

pm_install() {
  case "$1" in
    pnpm) pnpm i ;;
    yarn) yarn install ;;
    npm)  if [ -f "package-lock.json" ]; then npm ci; else npm install; fi ;;
  esac
}

rn_bin() {
  # chạy RN/Expo qua npx/yarn/pnpm tương ứng
  local cmd="$1"; shift
  case "$PKG" in
    pnpm) pnpm exec $cmd "$@" ;;
    yarn) yarn dlx $cmd "$@" 2>/dev/null || yarn $cmd "$@" ;;
    npm)  npx $cmd "$@" ;;
  esac
}

# ==== Start ====
log "Start reset for React Native & Gradle (Ubuntu/WSL)"
[ -f "package.json" ] || { echo "✖ Không thấy package.json trong thư mục hiện tại"; exit 1; }

# 0) PM
PKG="$(detect_pm)"
log "Package manager: $PKG"

# 1) Kill processes
log "Kill node & java if running..."
stop_if_running node
stop_if_running java

# 2) Clean Android build & Gradle
ANDROID_DIR="android"
APP_BUILD="$ANDROID_DIR/app/build"
ANDROID_GRADLE="$ANDROID_DIR/.gradle"
GRADLE_USER_CACHE="$HOME/.gradle/caches"

log "Clean Android build..."
safe_rm "$APP_BUILD"
safe_rm "$ANDROID_GRADLE"

if $DEEP_CLEAN; then
  log "Deep clean Gradle user cache (~/.gradle/caches)..."
  safe_rm "$GRADLE_USER_CACHE"
else
  log "Skip ~/.gradle/caches (pass --deep to remove)"
fi

# 3) Clean node_modules, .expo, lock files
log "Clean node_modules, .expo, lock files..."
safe_rm "node_modules"
safe_rm ".expo"
safe_rm ".expo-shared"
rm -f package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null || true

# 4) Reinstall dependencies
log "Install dependencies with $PKG..."
pm_install "$PKG"
ok "Dependencies installed"

# 5) Expo prebuild if app.json exists
if [ -f "app.json" ]; then
  log "Found app.json → expo prebuild --clean --no-install"
  rn_bin expo prebuild --clean --no-install
else
  log "No app.json → skip Expo prebuild"
fi

# 6) Reset Metro cache
log "Reset Metro cache (port $PORT)..."
# chạy nền 5s rồi kill để chỉ clear cache
(rn_bin react-native start --reset-cache --port "$PORT" >/dev/null 2>&1 & echo $! > .metro.pid)
sleep 5
if [ -f .metro.pid ]; then
  kill "$(cat .metro.pid)" 2>/dev/null || true
  rm -f .metro.pid
fi

# 7) Gradle clean (wrapper Linux: ./gradlew)
if [ -d "$ANDROID_DIR" ]; then
  log "Gradle clean..."
  pushd "$ANDROID_DIR" >/dev/null
  if [ -f "./gradlew" ]; then
    chmod +x ./gradlew
    ./gradlew clean --no-daemon
  else
    warn "Missing android/gradlew – hãy mở Android project bằng Android Studio để tạo wrapper."
  fi
  popd >/dev/null
else
  warn "Không có thư mục android/ – bỏ qua bước Gradle."
fi

# 8) Build & install Android (thiết bị/emulator phải sẵn sàng)
log "Build & install Android (react-native run-android)..."
rn_bin react-native run-android --port "$PORT"

ok "Done!"
