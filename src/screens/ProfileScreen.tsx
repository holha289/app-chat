import { selectUser } from "@app/features";
import { store } from "@app/store";
import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";

const ProfileScreen = () => {
  const user = selectUser(store.getState());
  return (
    <SafeAreaView className="flex-1 bg-white items-center pt-10">
      {/* Ảnh đại diện */}
      <Image
        source={{ uri: user?.avatar || "https://via.placeholder.com/150" }}
        className="w-32 h-32 rounded-full border-4 border-gray-200"
      />

      {/* Tên người dùng */}
      <Text className="mt-4 text-2xl font-bold text-gray-900">
        {user?.fullname || "Người dùng"}
      </Text>

      {/* Mô tả */}

      {/* Các nút hành động */}
      <View className="mt-6 w-full px-8 space-y-3">
        <TouchableOpacity className="bg-black py-3 rounded-2xl">
          <Text className="text-white text-center font-semibold">
            Chỉnh sửa hồ sơ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-gray-100 py-3 rounded-2xl">
          <Text className="text-black text-center font-semibold">Cài đặt</Text>
        </TouchableOpacity>

        <TouchableOpacity className="border border-red-500 py-3 rounded-2xl">
          <Text className="text-red-500 text-center font-semibold">
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
