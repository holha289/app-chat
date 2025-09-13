import { LoadingOverlay } from "@app/components";
import { selectAuthState, selectUser } from "@app/features";
import authActions from "@app/features/auth/auth.action";
import { store } from "@app/store";
import { ProfileClassStyle, ProfileStyle } from "@app/styles/profile.style";
import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from "react-redux";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(false);
  const handleLogout = () => {
    // Xử lý đăng xuất
    setIsLoading(true);
    dispatch(authActions.logout({
      callback: () => {
        setIsLoading(false);
        console.log("Logged out successfully");
        navigation.navigate("Login"); // Chuyển hướng về màn hình đăng nhập
      }
    }));
};
return (
  <SafeAreaView className={ProfileClassStyle.container} edges={['top']}>
    <ScrollView className="w-full flex-1">
      {/* Ảnh đại diện */}
      <LoadingOverlay visible={isLoading} />
      <View style={{ position: 'relative', marginBottom: 24, alignItems: 'center', flex: 1 }}>
        <Image
          source={{ uri: user?.avatar || "" }}
          className={ProfileClassStyle.avatar}
        />
        {/* Tên người dùng */}
        <Text className={ProfileClassStyle.title}>
          {user?.fullname || "Người dùng"}
        </Text>
      </View>

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
        <TouchableOpacity className="border border-red-500 py-3 rounded-2xl mt-4" onPress={handleLogout}>
          <Text className="text-red-500 text-center font-semibold">
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>
);
};

export default ProfileScreen;
