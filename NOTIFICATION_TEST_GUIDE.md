# Test Firebase Cloud Messaging

## Thông tin thiết bị:
- FCM Token: fMZ8txOWRoKAW3yEaLKnUr:APA91bHnwxNuV7ssQOvB0Ss2qfS4MxkYbS4H75wS-8lPC6V6NH7G6ZXLZGaaUoK6PA9tAJTN7-tmLD2VY-Sy_2FE_6ghOAIRBZJp2Wyj4pgt9kxJVLgaLsU
- Package: com.appchat.firebase
- Quyền thông báo: Đã được cấp

## Cách 1: Test qua Firebase Console
1. Vào https://console.firebase.google.com
2. Chọn project của bạn
3. Cloud Messaging > Send your first message
4. Nhập title và body
5. Ở mục Target, chọn "Select device" và dán FCM token ở trên

## Cách 2: Test qua cURL (cần Server Key)
```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
-H "Authorization: key=YOUR_SERVER_KEY" \
-H "Content-Type: application/json" \
-d '{
  "to": "fMZ8txOWRoKAW3yEaLKnUr:APA91bHnwxNuV7ssQOvB0Ss2qfS4MxkYbS4H75wS-8lPC6V6NH7G6ZXLZGaaUoK6PA9tAJTN7-tmLD2VY-Sy_2FE_6ghOAIRBZJp2Wyj4pgt9kxJVLgaLsU",
  "notification": {
    "title": "Test Notification",
    "body": "Đây là tin nhắn test từ Firebase FCM"
  },
  "data": {
    "type": "test",
    "message": "Hello from Firebase!"
  }
}'
```

## Lấy Server Key:
1. Firebase Console > Project Settings
2. Cloud Messaging tab
3. Copy "Server key" hoặc tạo Service Account key mới

## Ghi chú:
- App đã khởi tạo thành công
- Thông báo sẽ hiện khi app ở background
- Khi app ở foreground, sẽ hiện Alert dialog
- Kiểm tra console log để xem chi tiết
