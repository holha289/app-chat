import { selectAuthState, selectUser } from "@app/features";
import authActions from "@app/features/auth/auth.action";
import { store } from "@app/store";
import { ProfileClassStyle, ProfileStyle } from "@app/styles/profile.style";
import { useNavigation,useRoute  } from "@react-navigation/native";
import React from "react";

import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from "react-redux";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const handleLogout = () => {
    // Xử lý đăng xuất
    dispatch(authActions.logout());
    navigation.navigate("Login");
  };
  return (
    <SafeAreaView className={ProfileClassStyle.container}>
      {/* Ảnh đại diện */}
      <Image
        source={{ uri: user?.avatar || "" }}
        className={ProfileClassStyle.avatar}
      />

      {/* Tên người dùng */}
      <Text className={ProfileClassStyle.title}>
        {user?.fullname || "Người dùng"}
      </Text>

      {/* Mô tả */}

      {/* Các nút hành động */}
      <View className={ProfileClassStyle.actionBtn1}>
         <TouchableOpacity style={ProfileStyle.btn}>
          <Text className="font-semibold">
            Trạng thái hoạt động
          </Text>
          <FontAwesome name="dot-circle-o" size={18} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity style={ProfileStyle.btn} onPress={() => navigation.navigate("ProfileEdit")}>
          <Text className="font-semibold">
            Chỉnh sửa hồ sơ
          </Text>
          <FontAwesome name="pencil" size={18} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={ProfileStyle.btn}>
          <Text className="font-semibold">
            Báo cáo sự cố
          </Text>
          <FontAwesome name="exclamation-triangle" size={18} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={ProfileStyle.btn}>
          <Text className="text-center font-semibold">
            Trợ giúp
          </Text>
          <FontAwesome name="question-circle" size={18} color="#ccc" />
        </TouchableOpacity>
      </View>
      <View className="w-full">
        <TouchableOpacity className="border border-red-500 py-3 rounded-2xl mt-4">
            <Text className="text-red-500 text-center font-semibold" onPress={handleLogout}>
              Đăng xuất
            </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
