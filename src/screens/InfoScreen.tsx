import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "@app/components"; // Giả sử bạn có component này
import { selectUser } from "@app/features"; // Giả sử bạn có feature này
import { store } from "@app/store"; // Giả sử bạn có store này

// --- MOCK DATA & CONFIG ---
// Thay đổi giá trị `friendshipStatus` để test các giao diện khác nhau:
// "friends" | "pending" | "not_friends" | "blocked"
const MOCK_CONFIG = {
  friendshipStatus: "pending", // <--- THAY ĐỔI Ở ĐÂY ĐỂ TEST
};

const mockUser = {
  fullname: "Lê Thiên Trí",
  phone: "0919618654",
  avatar:
    "https://instagram.fsgn2-7.fna.fbcdn.net/v/t51.2885-15/525321721_17848562466528920_7802006014194459945_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjU2OHg0Mzkuc2RyLmY4Mjc4Ny5kZWZhdWx0X2ltYWdlLmMyIn0&_nc_ht=instagram.fsgn2-7.fna.fbcdn.net&_nc_cat=108&_nc_oc=Q6cZ2QHeArM7u8GYF3nFmIHqdeXzp-zJhTS_xH_gXqv30isiACnZvD4tGkCXyLGRNWQsEgA&_nc_ohc=Do0s00MZgl8Q7kNvwGB31Mu&_nc_gid=AdHpna7yjwigVd7QPEWSvQ&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzY4Njc0NTQyMjIxMjg5MzIxNA%3D%3D.3-ccb7-5&oh=00_AfS_9opViyRdBw5DTOnnJBphYAuyl2S5i98ebStEPp1SLw&oe=688DA7AC&_nc_sid=7a9f4b",
  gender: "Not Specified",
  id: 1753497322648486,
  slug: "usr_1753497322648571",
  dateOfBirth: "2025-07-26T02:35:22.648Z",
  status: "online",
};
// --- END MOCK DATA ---

const InfoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const params = route.params || {};
  const currentUser = selectUser(store.getState());

  const user = params.user ?? mockUser ?? currentUser;
  const friendship = params.friendship ?? MOCK_CONFIG.friendshipStatus;

  // --- Các hàm xử lý (giữ nguyên) ---
  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "Không có thông tin";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  const getGenderText = (gender: string | null | undefined): string => {
    return gender === "male"
      ? "Nam"
      : gender === "female"
        ? "Nữ"
        : "Không xác định";
  };

  // --- Logic cho các hành động ---
  const handleAddFriend = () =>
    Alert.alert("Xác nhận", "Gửi lời mời kết bạn đến " + user.fullname + "?");
  const handleAcceptFriend = () =>
    Alert.alert("Xác nhận", "Đồng ý kết bạn với " + user.fullname + "?");
  const handleDeclineFriend = () =>
    Alert.alert(
      "Xác nhận",
      "Từ chối lời mời kết bạn của " + user.fullname + "?",
    );
  const handleUnblock = () =>
    Alert.alert("Xác nhận", "Bạn có chắc muốn bỏ chặn người này?");

  // --- RENDER LOGIC ---

  // Giao diện khi người dùng bị chặn
  if (friendship === "blocked") {
    return (
      <SafeAreaView className="flex-1 bg-slate-100">
        <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center p-4 mt-1">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 bg-black/30 rounded-full"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Avatar
            uri={user?.avatar}
            name={user?.fullname || "Unknown"}
            size={128}
          />
          <Text className="mt-4 text-2xl font-bold text-gray-800">
            {user?.fullname || "Không có tên"}
          </Text>
          <Text className="text-base text-gray-500 mt-1">
            @{user?.slug?.replace("usr_", "") || "unknown"}
          </Text>
          <Text className="text-center text-gray-500 mt-4">
            Bạn đã chặn người này. Mọi thông tin khác đã được ẩn.
          </Text>
          <TouchableOpacity
            onPress={handleUnblock}
            className="mt-6 flex-row items-center justify-center bg-red-500 px-8 py-3 rounded-full shadow-lg"
          >
            <Ionicons name="hand-left-outline" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Bỏ chặn</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Giao diện cho các trường hợp còn lại (friends, pending, not_friends)
  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      {/* Header */}
      <View className="absolute top-4 left-0 right-0 z-10 flex-row items-center justify-between p-4 mt-1">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 bg-black/30 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Alert.alert("Tùy chọn khác")}
          className="p-2 bg-black/30 rounded-full"
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView className="mt-10" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="mb-6">
          <ImageBackground
            source={{ uri: user?.coverImage }}
            className="w-full h-52 bg-gray-300"
            resizeMode="cover"
          >
            <View className="w-full h-full bg-black/20" />
          </ImageBackground>
          <View className="items-center px-4 -mt-16">
            <View className="bg-white rounded-full p-1 shadow-lg">
              <Avatar
                uri={user?.avatar}
                name={user?.fullname || "Unknown"}
                size={128}
                showStatus
                status={user.status as any}
              />
            </View>
            <Text className="mt-3 text-2xl font-bold text-gray-900">
              {user?.fullname || "Không có tên"}
            </Text>
            <Text className="text-base text-gray-500 mt-1">
              @{user?.slug?.replace("usr_", "") || "unknown"}
            </Text>
          </View>
        </View>

        {/* Dynamic Action Buttons Container */}
        <View className="px-4 mb-6">
          {friendship === "friends" && (
            <View className="flex-row justify-center items-center space-x-3">
              <ActionButton
                icon="chatbubble-ellipses-outline"
                label="Nhắn tin"
                color="bg-blue-500"
                flex={1}
              />
              <ActionButton
                icon="call-outline"
                label="Gọi điện"
                color="bg-green-500"
                flex={1}
              />
              <TouchableOpacity className="p-3 rounded-full bg-gray-200">
                <Ionicons
                  name="checkmark-done-outline"
                  size={24}
                  color="#374151"
                />
              </TouchableOpacity>
            </View>
          )}
          {friendship === "pending" && (
            <View className="flex-row justify-center items-center space-x-3">
              <ActionButton
                onPress={handleAcceptFriend}
                icon="checkmark-outline"
                label="Xác nhận"
                color="bg-green-500"
                flex={1}
              />
              <ActionButton
                onPress={handleDeclineFriend}
                icon="close-outline"
                label="Từ chối"
                color="bg-gray-200"
                textColor="text-gray-800"
                flex={1}
              />
            </View>
          )}
          {friendship === "not_friends" && (
            <View className="flex-row justify-center items-center space-x-3">
              <ActionButton
                onPress={handleAddFriend}
                icon="person-add-outline"
                label="Kết bạn"
                color="bg-blue-500"
                flex={1}
              />
              <ActionButton
                icon="chatbubble-ellipses-outline"
                label="Nhắn tin"
                color="bg-gray-200"
                textColor="text-gray-800"
                flex={1}
              />
            </View>
          )}
        </View>

        {/* Info Blocks */}
        <View className="space-y-4 px-4 pb-10">
          <InfoCard title="Thông tin liên hệ">
            <InfoRow
              icon="call-outline"
              label="Số điện thoại"
              value={user?.phone || "Chưa cập nhật"}
            />
            <InfoRow
              icon="male-female-outline"
              label="Giới tính"
              value={getGenderText(user?.gender)}
            />
          </InfoCard>
          <InfoCard title="Thông tin cá nhân">
            <InfoRow
              icon="calendar-outline"
              label="Ngày sinh"
              value={formatDate(user?.dateOfBirth)}
            />
            <InfoRow
              icon="id-card-outline"
              label="ID Người dùng"
              value={user?.id || "N/A"}
            />
          </InfoCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Helper Components (Cải tiến nhẹ) ---

const InfoCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View className="bg-white rounded-2xl p-5 shadow-sm shadow-slate-200">
    <Text className="text-lg font-semibold text-gray-800 mb-4">{title}</Text>
    <View className="space-y-3">{children}</View>
  </View>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View className="flex-row items-center justify-between py-2">
    <View className="flex-row items-center">
      <Ionicons name={icon as any} size={22} color="#4b5563" className="w-7" />
      <Text className="text-gray-600 text-base ml-3">{label}</Text>
    </View>
    <Text
      className="text-gray-900 text-base font-medium text-right flex-1"
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

interface ActionButtonProps {
  icon: string;
  label: string;
  color: string;
  textColor?: string;
  flex?: number;
  onPress?: () => void;
}

const ActionButton = ({
  icon,
  label,
  color,
  textColor = "text-white",
  flex,
  onPress,
}: ActionButtonProps) => (
  <TouchableOpacity
    onPress={
      onPress || (() => Alert.alert("Thông báo", `${label} sẽ được cập nhật`))
    }
    className={`py-3.5 rounded-xl flex-row items-center justify-center shadow-md ${color}`}
    style={{ flex: flex }}
  >
    <Ionicons
      name={icon as any}
      size={20}
      color={textColor === "text-white" ? "white" : "#374151"}
    />
    <Text className={`${textColor} text-center font-semibold ml-2 text-base`}>
      {label}
    </Text>
  </TouchableOpacity>
);

// --- Component giả lập để code chạy được ---
// Trong app thật, bạn sẽ dùng component của mình
interface AppAvatarProps {
  uri?: string;
  name: string;
  size: number;
  showStatus?: boolean;
  status?: string;
  borderWidth?: number;
  borderColor?: string;
}

const AppAvatar = ({
  uri,
  name,
  size,
  showStatus,
  status,
  borderWidth,
  borderColor,
}: AppAvatarProps) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: "#ccc",
      borderWidth,
      borderColor: borderColor?.replace("border-", "") || "transparent",
    }}
    className="items-center justify-center"
  >
    {uri ? (
      <ImageBackground
        source={{ uri }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: size / 2,
          overflow: "hidden",
        }}
      />
    ) : (
      <Text style={{ fontSize: size / 3 }}>{name.charAt(0)}</Text>
    )}
    {showStatus && (
      <View
        style={{
          position: "absolute",
          bottom: 5,
          right: 5,
          width: size / 6,
          height: size / 6,
          borderRadius: size / 12,
          backgroundColor: status === "online" ? "green" : "gray",
          borderWidth: 2,
          borderColor: "white",
        }}
      />
    )}
  </View>
);
// ---

export default InfoScreen;
