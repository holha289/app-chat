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

## Cách 2: Test qua FCM HTTP v1 API (bảo mật hơn, khuyến nghị dùng)

### Bước 1: Tạo Service Account và lấy file JSON key
1. Vào Firebase Console > Project Settings > Service Accounts
2. Nhấn "Generate new private key" để tải file JSON về

### Bước 2: Lấy access token từ file service account
Sử dụng lệnh sau (cần cài đặt gcloud hoặc python):

#### Cách nhanh với gcloud:
```bash
gcloud auth activate-service-account --key-file=service-account.json
gcloud auth print-access-token
```

#### Hoặc dùng python:
```python
from google.oauth2 import service_account
import google.auth.transport.requests

SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"]
SERVICE_ACCOUNT_FILE = "service-account.json"

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)
request = google.auth.transport.requests.Request()
credentials.refresh(request)
print(credentials.token)
```

### Bước 3: Gửi thông báo qua FCM HTTP v1
```bash
curl -X POST \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json; UTF-8" \
  https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send \
  -d '{
    "message": {
      "token": "fMZ8txOWRoKAW3yEaLKnUr:APA91bHnwxNuV7ssQOvB0Ss2qfS4MxkYbS4H75wS-8lPC6V6NH7G6ZXLZGaaUoK6PA9tAJTN7-tmLD2VY-Sy_2FE_6ghOAIRBZJp2Wyj4pgt9kxJVLgaLsU",
      "notification": {
        "title": "Test Notification",
        "body": "Đây là tin nhắn test từ FCM HTTP v1"
      },
      "data": {
        "type": "test",
        "message": "Hello from Firebase!"
      }
    }
  }'
```

Thay `ACCESS_TOKEN` bằng token lấy ở bước 2, `YOUR_PROJECT_ID` bằng project id Firebase của bạn.

## Lấy Server Key:
1. Firebase Console > Project Settings
2. Cloud Messaging tab
3. Copy "Server key" hoặc tạo Service Account key mới

## Ghi chú:
- App đã khởi tạo thành công
- Thông báo sẽ hiện khi app ở background
- Khi app ở foreground, sẽ hiện Alert dialog
- Kiểm tra console log để xem chi tiết
