# Screenshots Guide

## Cách thêm screenshots cho demo app

1. **Chụp màn hình từ thiết bị của bạn**
2. **Copy các file ảnh vào thư mục này** với tên file tương ứng:

### Danh sách screenshots cần thiết:

- `profile_screen.jpg` - Màn hình thông tin cá nhân
- `user_info.jpg` - Chi tiết thông tin user
- `chat_screen.jpg` - Giao diện chat chính
- `message_actions.jpg` - Modal tương tác tin nhắn (emoji + actions)
- `login_screen.jpg` - Màn hình đăng nhập
- `register_screen.jpg` - Màn hình đăng ký

### Kích thước khuyến nghị:
- **Resolution**: 1080x1920 (9:16) hoặc tương tự
- **Format**: JPG hoặc PNG
- **File size**: < 2MB mỗi file

### Ví dụ copy file từ Windows:
```powershell
# Copy từ thư mục screenshot của điện thoại
copy "C:\Users\ttri0\AppData\Local\Packages\Microsoft.YourPhone_8wekyb3d8bbwe\TempState\medias\Screenshot_2025-*" .\docs\screenshots\

# Đổi tên file cho phù hợp
ren "Screenshot_2025-09-05-07-40-01.jpg" "login_screen.jpg"
ren "Screenshot_2025-09-05-07-40-15.jpg" "chat_screen.jpg"
# ... tiếp tục với các file khác
```

### Hiển thị trong README:
Sau khi copy xong, các ảnh sẽ hiển thị tự động trong README.md chính của project.
