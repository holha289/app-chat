import { selectAuthLoading, selectUser } from "@app/features";
import authActions from "@app/features/auth/auth.action";
import { ProfileClassStyle, ProfileStyle } from "@app/styles/profile.style";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import React from "react";

import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from "react-redux";
import { Input, LoadingOverlay } from "@app/components";
import { Select } from "@app/components/Select";
import { classBtn } from "@app/styles/main.style";
import { clsx } from "clsx";
import { CameraOptions, ImageLibraryOptions, ImagePickerResponse, launchCamera, launchImageLibrary } from "react-native-image-picker";
import UploadService from "@app/services/upload.service";
import { requestCameraPermissions, requestFilePermissions, requestMediaPermissions } from "@app/core/permissions";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    avatar: user?.avatar || "",
  });
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Nếu không có screen để go back, navigate về Profile tab
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'TabNavigator',
              state: {
                routes: [
                  { name: 'Profile' }, // Chuyển về Profile tab
                ],
                index: 0,
              },
            },
          ],
        })
      );
    }
  };

  const handleSave = () => {
    console.log("Update profile action dispatched:", form);
    setLoading(true);
    dispatch(authActions.updateProfile({
      user: form,
      callback(error) {
        if (error) {
          Alert.alert('Lỗi', error);
        } else {
           handleGoBack();
        }
        setLoading(false);
      },
    }));
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Chọn ảnh',
      'Chọn nguồn ảnh',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(),
        },
        {
          text: 'Thư viện',
          onPress: () => openGallery(),
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    const permission = await requestCameraPermissions();
    if (!permission) {
      Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập camera để chụp ảnh.');
      return;
    }
    const options: CameraOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
      includeBase64: false,
    };

    launchCamera(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
        return;
      }

      if (response.errorMessage) {
        Alert.alert('Lỗi', 'Không thể mở camera: ' + response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          const uploadedImageUri = await UploadService.uploadSingleFile(imageUri);
          setForm({ ...form, avatar: uploadedImageUri });
        }
      }
    });
  };

  const openGallery = async () => {
    const permission = await requestFilePermissions();
    if (!permission) {
      Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập bộ nhớ để chọn ảnh.');
      return;
    }
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
      includeBase64: false,
      selectionLimit: 1,
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled gallery');
        return;
      }

      if (response.errorMessage) {
        Alert.alert('Lỗi', 'Không thể mở thư viện ảnh: ' + response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          const uploadedImageUri = await UploadService.uploadSingleFile(imageUri);
          setForm({ ...form, avatar: uploadedImageUri });
        }
      }
    });
  };

  return (
    <SafeAreaView className={ProfileClassStyle.containerEdit}>
      {/* Ảnh đại diện */}
      <View style={{ position: 'relative', marginBottom: 24, alignItems: 'center' }}>
        <Image
          source={{ uri: form?.avatar || "" }}
          className={ProfileClassStyle.avatar}
        />
        <TouchableOpacity
          style={ProfileStyle.uploadBtn}
          onPress={() => handleImagePicker()}
        >
          <Ionicons name="camera" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Các nút hành động */}
      <View className={ProfileClassStyle.actionBtn1Edit}>
        <View className="mb-4">
          <Input
            placeholder="Nhập họ và tên"
            value={form.fullname}
            onChangeText={(text) => {
              setForm({ ...form, fullname: text });
            }}
            label="Họ và tên"
            rounded={10}
          />
        </View>
        <View className="mb-4">
          <Input
            placeholder="Nhập email"
            value={form.email}
            onChangeText={(text) => {
              setForm({ ...form, email: text });
            }}
            label="Email"
            rounded={10}
          />
        </View>
        <View className="mb-4">
          <Input
            placeholder="Nhập số điện thoại"
            value={form.phone}
            onChangeText={(text) => {
              setForm({ ...form, phone: text });
            }}
            readOnly={true}
            label="Số điện thoại"
            rounded={10}
          />
        </View>
        <View className="mb-4">
          <Select
            options={[
              { value: "male", label: "Nam" },
              { value: "female", label: "Nữ" },
              { value: "other", label: "Khác" }
            ]}
            value={form.gender}
            onChange={(value) => setForm({ ...form, gender: value })}
            placeholder="Chọn giới tính"
            label="Giới tính"
          />
        </View>
      </View>
      <View className="w-full">
        <TouchableOpacity
          className={clsx(classBtn.primary, 'mt-4')}
          onPress={handleSave}
        >
          <Text className={classBtn.primaryText}>
            Lưu
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
