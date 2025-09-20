# Ap## 🚀 Tải APK & Demo

### 📲 **Download APK** 
**[⬇️ Tải APK Android](https://dply.me/5n6xwv)**

> Ứng dụng đã được build và deploy sẵn. Chỉ cần tải về và cài đặt trực tiếp trên thiết bị Android.

### ⚡ **Quick Start**
1. **Tải APK** từ link trên về điện thoại Android
2. **Bật Unknown Sources** trong Settings > Security 
3. **Cài đặt APK** và mở ứng dụng
4. **Đăng ký tài khoản** mới hoặc đăng nhập
5. **Test các tính năng**:
   - Long press tin nhắn để mở modal với emoji reactions
   - Thử copy tin nhắn, reply, forward
   - Test real-time chat với Socket.io
   - Xem profile, edit thông tin cá nhân

## 📱 Demo Ứng dụng React Native Expo Project

Ứng dụng chat đa nền tảng xây dựng với React Native, Expo, Redux Toolkit, Firebase, Socket.io và NativeWind (Tailwind CSS cho React Native).

## � Tải APK & Demo

### 📲 **Download APK** 
**[⬇️ Tải APK Android](https://dply.me/5n6xwv)**

> Ứng dụng đã được build và deploy sẵn. Chỉ cần tải về và cài đặt trực tiếp trên thiết bị Android.

## �📱 Demo Ứng dụng

### Màn hình Profile & Thông tin cá nhân
<div align="center">
  <img src="docs/screenshots/profile_screen.jpg" width="300" alt="Profile Screen" />
  <img src="docs/screenshots/user_info.jpg" width="300" alt="User Info" />
</div>

*Hiển thị thông tin cá nhân với avatar, trạng thái hoạt động, và các tùy chọn cài đặt*

### Màn hình Chat & Tin nhắn
<div align="center">
  <img src="docs/screenshots/chat_screen.jpg" width="300" alt="Chat Screen" />
  <img src="docs/screenshots/message_actions.jpg" width="300" alt="Message Actions" />
</div>

*Giao diện chat với tin nhắn thời gian thực, emoji reactions và các tùy chọn tương tác*

### Xác thực & Đăng ký
<div align="center">
  <img src="docs/screenshots/login_screen.jpg" width="300" alt="Login Screen" />
  <img src="docs/screenshots/register_screen.jpg" width="300" alt="Register Screen" />
</div>

*Màn hình đăng nhập và đăng ký tài khoản mới*

> **Lưu ý**: Screenshots được lưu tại thư mục `docs/screenshots/`. Bạn có thể copy các file ảnh từ thiết bị của mình vào đây để hiển thị demo app.

## 🔥 Tính năng nổi bật

### 💬 **Chat Features**
- **Tin nhắn thời gian thực**: Socket.io với latency thấp
- **Message Modal**: Long press để hiện emoji reactions và 12 action buttons
- **Emoji Reactions**: 6 emoji phổ biến (👍😍😂😮😢😡)  
- **Copy tin nhắn**: Clipboard integration với error handling
- **Reply & Forward**: Trả lời và chuyển tiếp tin nhắn
- **Message Actions**: Pin, Reminder, Quick Message, Translate, Read Aloud

### 🔐 **Authentication**
- **Firebase Auth**: Đăng ký/đăng nhập an toàn
- **Session Persist**: Lưu trạng thái đăng nhập với Redux-persist  
- **Auto Login**: Tự động đăng nhập khi mở app

### 🎨 **UI/UX**
- **NativeWind**: Tailwind CSS cho React Native
- **Responsive Design**: Tối ưu cho mọi kích thước màn hình
- **Dark/Light Theme**: Hỗ trợ theme động
- **Smooth Animations**: React Native Reanimated

### 🔔 **Notifications**  
- **Firebase FCM**: Push notifications
- **Real-time Updates**: Thông báo tin nhắn mới
- **Badge Counter**: Đếm tin nhắn chưa đọc


## 📁 Cấu trúc dự án

```
app-chat/
├── src/
│   ├── components/   # Các UI component tái sử dụng (Input, Avatar, ...)
│   ├── core/         # Firebase, socket, permissions, ...
│   ├── features/     # Redux slices: auth, counter, contact, ...
│   ├── hooks/        # Custom hooks
│   ├── navigation/   # AppNavigator, TabNavigator, RootNavigation
│   ├── routers/      # Định nghĩa route cho navigation
│   ├── screens/      # Các màn hình chính, pages, messages
│   ├── services/     # API service, notification service
│   ├── store/        # Redux store, middleware, persist config
│   ├── styles/       # Style file cho từng màn hình/component
│   ├── types/        # Định nghĩa type, interface chung
│   └── utils/        # Tiện ích, helper (handleNotify, ...)
├── assets/           # Hình ảnh, icon, svg
├── App.tsx           # Entry point
├── global.css        # Global style
├── package.json      # Thông tin package, scripts
├── tailwind.config.js# Cấu hình Tailwind
└── ...
```

yarn install

## 🛠️ Hướng dẫn chạy dưới Local

### Yêu cầu hệ thống
- Node.js >= 16
- npm hoặc yarn
- Android Studio (Android), Xcode (iOS/macOS)
- React Native CLI
- JDK 17 hoặc mới hơn

### Cài đặt và chạy ứng dụng

1. **Clone dự án và cài đặt dependencies**
```bash
git clone https://github.com/holha289/app-chat.git
cd app-chat

# Cài đặt dependencies
npm install
# hoặc
yarn install
```

2. **Xóa cache và prebuild**
```bash
# Xóa cache và clean project
npm run prebuild:clear
# hoặc nếu chưa có script này, chạy thủ công:
# npx expo prebuild --clean --platform android
```

3. **Khởi chạy với React Native CLI**
```bash
# Khởi động Metro bundler
npm run native:start
# hoặc
npx react-native start

# Trong terminal khác, chạy trên Android
npm run native:android
# hoặc
npx react-native run-android

# Hoặc chạy trên iOS (chỉ trên macOS)
npm run native:ios
# hoặc
npx react-native run-ios
```

### Scripts hỗ trợ
```bash
# Reset cache Metro bundler khi gặp lỗi
npm run native:start:reset

# Clean build Android
npm run gradlew:clean

# Build APK release
npm run build:release
```

### Lưu ý quan trọng
- Đảm bảo đã cài đặt Android SDK và thiết lập biến môi trường `ANDROID_HOME`
- Bật USB Debugging trên thiết bị Android hoặc chạy Android Emulator
- Với iOS, cần có Xcode và iOS Simulator

### 🔄 **Option 1: Sử dụng APK có sẵn (Khuyên dùng)**
```bash
# Tải APK từ link: https://dply.me/5n6xwv
# Cài đặt trực tiếp trên thiết bị Android
# Không cần build source code
```

### 🛠️ **Option 2: Build từ source code**
```bash
# Prebuild native code (Android)
npx expo prebuild --platform android

# Build và cài app Android
cd android
./gradlew --stop         # Dừng daemon nếu có
./gradlew clean          # Xoá build cũ
./gradlew assembleDebug  # Build debug APK
./gradlew installDebug   # Cài app lên thiết bị/emulator

# (Tuỳ chọn) Mở app trên thiết bị/emulator Android
adb shell am start -n <package_name>/<activity_name>

# Xóa cache Metro bundler (nếu cần reload JS)
npx expo start --clear
# Reset node_modules (nếu gặp lỗi lạ)
rm -rf node_modules package-lock.json
npm install
```

### Build iOS (chỉ trên macOS, nếu cần)
```bash
npx expo prebuild --platform ios
cd ios
xcodebuild clean
# Mở Xcode để build/run thủ công hoặc dùng lệnh xcodebuild
```


### Thêm màn hình mới
1. Tạo file mới trong `src/screens/` (ví dụ: `NewScreen.tsx`)
2. Thêm route vào `src/routers/index.router.ts`
3. Nếu là tab, thêm vào `tab.router.ts`
4. Định nghĩa type cho navigation nếu cần ở `src/types/navigator.ts`

### Thêm feature mới (Redux slice)
1. Tạo thư mục mới trong `src/features/` (ví dụ: `chat/`)
2. Tạo các file: `chat.reducer.ts`, `chat.action.ts`, ...
3. Thêm reducer vào `src/store/index.ts`


### Sử dụng API service
```typescript
import { apiService } from '@/services/api.service';
// GET
const data = await apiService.get('/users');
// POST
const result = await apiService.post('/users', { name: 'John' });
```


### Sử dụng notification
Notification được xử lý qua Firebase Cloud Messaging và notifee. Xem `src/core/firebase.ts` và `src/services/notification.service.ts`.

### Sử dụng socket
Socket.io client được khởi tạo ở `src/core/socketIo.ts` và tích hợp vào App qua middleware.

### Message Modal & Interactions
App có hệ thống modal tương tác tin nhắn tương tự WhatsApp/Telegram:

```typescript
// Trong MessageRow.tsx - Long press để mở modal
<TouchableOpacity 
  onLongPress={() => setShowModal(true)}
  // ...
>
  {/* Tin nhắn */}
</TouchableOpacity>

// MessageModelEvent.tsx - Modal với emoji và actions
const EMOJI_REACTIONS = ['👍', '😍', '😂', '😮', '😢', '😡'];
const ACTION_BUTTONS = [
  { id: 'reply', name: 'Trả lời', icon: 'arrow-undo' },
  { id: 'forward', name: 'Chuyển tiếp', icon: 'arrow-forward' },
  { id: 'copy', name: 'Sao chép', icon: 'copy' },
  // ... 9 actions khác
];
```

**Tính năng Modal:**
- 6 emoji reactions phổ biến  
- 12 action buttons (Reply, Forward, Copy, Pin, Reminder, v.v.)
- Copy tin nhắn vào clipboard với error handling
- Đóng modal khi tap outside
- Animation mượt mà với React Native

## 🌐 Deployment

### APK Distribution
- **Platform**: dply.me (APK hosting service)
- **Link**: https://dply.me/5n6xwv
- **Build**: Production-ready APK với Firebase config
- **Size**: ~50MB (bao gồm native dependencies)

### Build Info
```bash
# Build commands đã sử dụng
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

**APK Features:**
- ✅ Firebase Auth & Cloud Messaging
- ✅ Socket.io real-time messaging  
- ✅ Redux-persist session storage
- ✅ NativeWind responsive UI
- ✅ Message modal with emoji reactions
- ✅ Clipboard copy functionality


## 🔍 Troubleshooting

1. **Không build được Android/iOS:**
   - Chạy `npx expo prebuild --platform android` hoặc `ios` để sync native code
   - Xóa cache: `npx expo start --clear`
   - Xóa node_modules: `rm -rf node_modules package-lock.json && npm install`
2. **Không nhận được notification:**
   - Kiểm tra quyền notification, GoogleService-Info.plist, google-services.json
   - Kiểm tra cấu hình Firebase
3. **NativeWind không hoạt động:**
   - Kiểm tra `tailwind.config.js`, `babel.config.js`, import `global.css`


## 📝 Quy tắc code

- Sử dụng TypeScript cho toàn bộ codebase
- Ưu tiên NativeWind (Tailwind CSS) cho layout, spacing, flex, căn chỉnh
- Đặt tên file theo PascalCase cho component, camelCase cho biến/hàm
- Sử dụng absolute imports với alias `@/`
- Tách biệt rõ các layer: UI, logic, API, store


## 📄 License

Dự án này được phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

## 👥 Tác giả

- **Hải Long** - *Main* - [GitHub](https://github.com/holha289)
- **Thiên Tri** - *...* - [GitHub](https://github.com/thientrile)

---
**Lưu ý**: Đây là dự án học tập về lập trình đa nền tảng với React Native và Expo.
