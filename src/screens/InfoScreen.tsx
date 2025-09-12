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
import { InfoClassStyle } from "@app/styles/info.style";
import { colors } from "@app/styles/main.style";
import { InfoCard, InfoRow } from "@app/components/InfoCard";
import ActionButton from "@app/components/ActionButton";
import Helpers from "@app/utils/helpers";

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
  const friendship = params.friendshipStatus || MOCK_CONFIG.friendshipStatus;
  console.log(user, friendship);

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
  // Giao diện cho các trường hợp còn lại (friends, pending, not_friends)
  return (
    <SafeAreaView className={InfoClassStyle.container}>
       {friendship === "blocked" ? (
          <View className={InfoClassStyle.boxBlocked}>
            <Avatar
              uri={user.room_avatar ? user.room_avatar : (Array.isArray(user.avatar) ? user.avatar[0] : user.avatar) }
              name={user?.fullname || user?.name || "Unknown"}
              size={128}
            />
            <Text className="mt-4 text-2xl font-bold text-gray-800">
              {user?.fullname || user?.name || "Không có tên"}
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
        ) : (
          <ScrollView className="flex-1 w-full" showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <View className="mb-6">
              <ImageBackground
                source={{ uri: user?.coverImage || "https://picsum.photos/800/400" }}
                className="w-full h-52 bg-gray-300"
                resizeMode="cover"
              >
                <View className="w-full h-full bg-black/20" />
              </ImageBackground>
              <View className="items-center px-4 -mt-16">
                <View className="bg-white rounded-full p-1 shadow-lg">
                  <Avatar
                    uri={user.room_avatar ? user.room_avatar : (Array.isArray(user.avatar) ? user.avatar[0] : user.avatar) }
                    name={user?.fullname || "Unknown"}
                    size={128}
                    showStatus
                    status={user.status as any}
                  />
                </View>
                <Text className="mt-3 text-2xl font-bold text-gray-900">
                  {user?.fullname || user?.name || "Không có tên"}
                </Text>
                <Text className="text-base text-gray-500 mt-1">
                  @{user?.slug?.replace("usr_", "") || "unknown"}
                </Text>
              </View>
            </View>

            {/* Dynamic Action Buttons Container */}
            <View className={InfoClassStyle.boxBtn}>
              <View className={InfoClassStyle.rowBtn}>
                {friendship === "friends" ? (
                  <>
                    <ActionButton
                      icon="chatbubble-ellipses-outline"
                      label="Nhắn tin"
                      color={`bg-[${colors.fourdary}]`}
                      textColor="text-black"
                      flex={1}
                    />
                    <ActionButton
                      icon="call-outline"
                      label="Gọi điện"
                      color={`bg-[${colors.primary}]`}
                      flex={1}
                    />
                  </>
                )
                  : friendship === "pending" ? (
                    <>
                      <ActionButton
                        onPress={handleDeclineFriend}
                        icon="close-outline"
                        label="Từ chối"
                        color="bg-red-500"
                        textColor="text-white"
                        flex={1}
                      />
                      <ActionButton
                        onPress={handleAcceptFriend}
                        icon="checkmark-outline"
                        label="Xác nhận"
                        color={`bg-[${colors.primary}]`}
                        flex={1}
                      />
                    </>
                  ) : friendship === "not_friends" ? (
                    <>
                      <ActionButton
                        icon="chatbubble-ellipses-outline"
                        label="Nhắn tin"
                        color={`bg-[${colors.fourdary}]`}
                        textColor="text-gray-800"
                        flex={1}
                      />
                      <ActionButton
                        onPress={handleAddFriend}
                        icon="person-add-outline"
                        label="Kết bạn"
                        color={`bg-[${colors.primary}]`}
                        flex={1}
                      />
                    </>
                  ) : friendship === 'group' ? (
                    <>
                      <ActionButton
                        icon="chatbubble-ellipses-outline"
                        label="Nhắn tin"
                        color={`bg-[${colors.fourdary}]`}
                        textColor="text-gray-800"
                        flex={1}
                      />
                      <ActionButton
                        onPress={handleAddFriend}
                        icon="person-add-outline"
                        label="Thêm thành viên"
                        color={`bg-[${colors.primary}]`}
                        flex={1}
                      />
                    </>
                  ) : null}
              </View>
            </View>

            {/* Info Blocks */}
            <View className="space-y-4 px-4 pb-10 gap-y-4">
              { friendship === 'groups' ? (
                <InfoCard title="Thông tin nhóm">
                  <InfoRow
                    icon="people-outline"
                    label="Số thành viên"
                    value={user?.member_count || 0}
                  />
                </InfoCard>
              ) : (
                <>
                <InfoCard title="Thông tin liên hệ">
                  <InfoRow
                    icon="call-outline"
                    label="Số điện thoại"
                    value={user?.phone || "Chưa cập nhật"}
                  />
                  <InfoRow
                    icon="male-female-outline"
                    label="Giới tính"
                    value={Helpers.getGenderText(user?.gender)}
                  />
                </InfoCard>
                <InfoCard title="Thông tin cá nhân">
                  <InfoRow
                    icon="calendar-outline"
                    label="Ngày sinh"
                    value={Helpers.formatDate(user?.dateOfBirth)}
                  />
                  <InfoRow
                    icon="id-card-outline"
                    label="ID Người dùng"
                    value={user?.id || "N/A"}
                  />
                </InfoCard>
                </>
              )}
            </View>
          </ScrollView>
        )}
    </SafeAreaView>
  );
};

export default InfoScreen;
