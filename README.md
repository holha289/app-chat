# App Chat - React Native Expo Project

Ứng dụng chat được xây dựng bằng React Native và Expo với NativeWind (Tailwind CSS).

## 🚀 Tính năng

- ✅ React Native với Expo
- ✅ NativeWind (Tailwind CSS cho React Native)
- ✅ TypeScript
- ✅ React Navigation
- ✅ Axios cho API calls
- ✅ Vector Icons
- ✅ Reanimated

## 📱 Cấu trúc dự án

```
app-chat/
├── src/
│   ├── components/          # Các component tái sử dụng
│   │   └── Input.tsx
│   ├── hooks/              # Custom hooks
│   │   └── use-hook.ts
│   ├── navigation/         # Cấu hình navigation
│   │   ├── AppNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── routers/           # Router configuration
│   │   └── index.router.ts
│   ├── screens/           # Các màn hình
│   │   └── HomeScreen.tsx
│   ├── services/          # API services
│   │   └── api.service.ts
│   ├── styles/            # Style files
│   │   ├── home.style.ts
│   │   └── input.style.ts
│   └── types/             # TypeScript types
│       └── navigator.ts
├── assets/                # Hình ảnh, icons
├── App.tsx               # Entry point
├── global.css            # Global styles
├── package.json
└── README.md
```

## 🛠️ Cài đặt

### Yêu cầu hệ thống

- Node.js (v16 trở lên)
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android)
- Xcode (cho iOS - chỉ trên macOS)

### Cài đặt dependencies

```bash
# Clone project
git clone <repository-url>
cd app-chat

# Cài đặt dependencies
npm install

# Hoặc sử dụng yarn
yarn install
```


## 🏃‍♂️ Chạy dự án

```bash
# Khởi động development server
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios

# Chạy trên web
npm run web


# Prebuild native code (Android/iOS)
# Nếu muốn sử dụng cache khi prebuild, thêm tuỳ chọn --cache:
npx expo prebuild --platform android --cache
npx expo prebuild --platform ios --cache
# Nếu gặp lỗi cache khi prebuild, hãy xóa cache trước:
npx expo start --clear
./gradlew clean
npx expo prebuild --platform android
npx expo prebuild --platform ios

# Xóa cache build iOS (nên chạy trong thư mục ios):
xcodebuild clean
npx expo prebuild --platform ios

# Build APK cho Android (Expo EAS):
npx eas build --platform android --profile preview
# Build AAB cho Android (Expo EAS):
npx eas build --platform android --profile production
# Build iOS (Expo EAS):
npx eas build --platform ios --profile preview
# Kiểm tra thiết bị kết nối:
adb devices
# Mở project trên Expo Go (quét QR):
npx expo start
# Xóa cache Metro bundler:
npx expo start --clear
# Reset node_modules:
rm -rf node_modules package-lock.json
npm install
```

## 📁 Thêm màn hình mới

1. Tạo component mới trong `src/screens/`
2. Thêm route vào `src/navigation/AppNavigator.tsx`
3. Định nghĩa type cho navigation trong `src/types/navigator.ts`

Ví dụ:

```tsx
// src/screens/NewScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

const NewScreen = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold">New Screen</Text>
    </View>
  );
};

export default NewScreen;
```

## 🎯 API Integration

Sử dụng Axios service trong `src/services/api.service.ts`:

```typescript
import { apiService } from '@/services/api.service';

// GET request
const data = await apiService.get('/users');

// POST request
const result = await apiService.post('/users', { name: 'John' });
```

## 🔍 Troubleshooting

### Lỗi thường gặp:

1. **Metro bundler cache**: `npx expo start --clear`
2. **Node modules**: Xóa `node_modules` và chạy lại `npm install`
3. **NativeWind không hoạt động**: Kiểm tra cấu hình trong `tailwind.config.js` và `babel.config.js`

### Debug:

```bash
# Xóa cache
npx expo start --clear

# Reset project
rm -rf node_modules package-lock.json
npm install
```


## 📝 Quy tắc code

- Sử dụng TypeScript cho tất cả files
- Ưu tiên NativeWind (Tailwind CSS) cho layout, spacing, flex, căn chỉnh thay vì StyleSheet. Chỉ dùng StyleSheet cho các style động phức tạp hoặc khi cần hiệu năng cao.
- Đặt tên file theo PascalCase cho components
- Sử dụng absolute imports với alias `@/`

## 💡 Hướng dẫn sử dụng NativeWind cho bố cục

Ví dụ căn nút xuống cuối trang:

```tsx
<View className="flex-1">
  <View className="flex-1">
    {/* Nội dung form */}
  </View>
  <View className="justify-end pb-8">
    <Button title="Đăng ký" />
  </View>
</View>
```

Hoặc với ScrollView:

```tsx
<ScrollView className="flex-1">
  <View className="flex-1 justify-between">
    {/* Nội dung */}
    <Button title="Đăng ký" />
  </View>
</ScrollView>
```

> **Lưu ý:** Nếu dùng StyleSheet cho layout, cần đảm bảo cha có `flex: 1` và con có `justifyContent: 'flex-end'` để nút nằm dưới cùng.

## 📄 License

Dự án này được phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

## 👥 Tác giả

- **Hải Long** - *Initial work* - [GitHub](https://github.com/holha289)

## 🙏 Acknowledgments

- [Expo](https://expo.dev/)
- [NativeWind](https://nativewind.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Lưu ý**: Đây là dự án học tập về lập trình đa nền tảng với React Native và Expo.
