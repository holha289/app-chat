import notifee, { AuthorizationStatus } from '@notifee/react-native';

const requestPermission = async () => {
  let status = false
  const settings = await notifee.requestPermission();
  if (settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED) {
    // 💬 Hiện popup xin quyền nếu lần đầu
    const newSettings = await notifee.requestPermission();
    if (newSettings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      status = true;
    } else if (newSettings.authorizationStatus === AuthorizationStatus.DENIED) {
      console.log('❌ Người dùng từ chối quyền. Yêu cầu bật trong Cài đặt');
      status = false;
    } else {
      console.log('❌ Không rõ trạng thái quyền thông báo');
      status = false;
    }
  } else if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
    console.log('❌ Người dùng từ chối quyền. Yêu cầu bật trong Cài đặt');
    status = false;
  } else {
    console.log('✅ Đã có quyền thông báo');
    status = true;
  }
  return status;
}

export { requestPermission };
