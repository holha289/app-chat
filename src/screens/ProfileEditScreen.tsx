import { selectAuthLoading, selectAuthState, selectAuthSuccess, selectUser } from "@app/features";
import authActions from "@app/features/auth/auth.action";
import { store } from "@app/store";
import { ProfileClassStyle, ProfileStyle } from "@app/styles/profile.style";
import { CommonActions, useNavigation,useRoute  } from "@react-navigation/native";
import React, { use, useEffect } from "react";

import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from "react-redux";
import { Input, LoadingOverlay } from "@app/components";
import { Select } from "@app/components/Select";
import { classBtn } from "@app/styles/main.style";
import { clsx } from "clsx";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const [form, setForm] = React.useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
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
     dispatch(authActions.updateProfile({ 
       user: form, 
       callback() {
         handleGoBack();
       }, 
     }));
  };

  return (
    <SafeAreaView className={ProfileClassStyle.containerEdit}>
      {/* Ảnh đại diện */}
      <View style={{ position: 'relative', marginBottom: 24, alignItems: 'center' }}>
        <Image
          source={{ uri: user?.avatar || "" }}
          className={ProfileClassStyle.avatar}
        />
        <TouchableOpacity 
          style={ProfileStyle.uploadBtn}
          onPress={() => {
            // TODO: Thêm logic upload ảnh
            console.log("Upload ảnh");
          }}
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
