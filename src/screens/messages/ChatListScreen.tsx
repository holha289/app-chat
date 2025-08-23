import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Avatar, LoadingOverlay } from "@app/components";
import { selectUser } from "@app/features";
import { store } from "@app/store";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import msgActions from "@app/features/message/msg.action";
import {
  selectMessage,
  selectMsgStatus,
  selectRooms,
} from "@app/features/message/msg.selectors";
import { useSelector } from "react-redux";

export default function ChatListScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const conversations = useSelector(selectRooms) ?? []; // 🔥 lấy trực tiếp từ store
  const status = useSelector(selectMsgStatus); // để biết đang loading

  const refreshing = status === "pending";

  const onRefresh = useCallback(() => {
    dispatch(msgActions.getRoom()); // thunk/saga sẽ cập nhật store
  }, [dispatch]);

  useEffect(() => {
    onRefresh(); // load lần đầu
  }, [onRefresh]);
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm"
      onPress={() => navigation.navigate("ChatRoom", item)}
    >
      <Image
        source={{ uri: item.avatar }}
        className="w-14 h-14 rounded-full mr-4"
      />
      <View className="flex-1">
        <View className="flex-row justify-between mb-1">
          <Text className="font-semibold text-base">{item.name}</Text>
          <Text className="text-xs text-gray-400">
            {item.last_message.createdAt}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          className={`text-sm ${
            item.is_read ? "font-bold text-black" : "text-gray-500"
          }`}
        >
          {item.last_message.msg_content}
        </Text>
      </View>
      {item.is_read && (
        <View className="w-2 h-2 bg-red-500 rounded-full ml-2" />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 px-4">
      <View className="flex-row justify-between items-center  mb-4">
        <Text className="text-3xl font-extrabold text-blue-600">WChat</Text>
        <View className="flex-row items-center space-x-2">
          <Ionicons name="create-outline" size={24} color="#3b82f6" />
          {/* <Avatar
            uri={user?.avatar}
            name={user?.fullname}
            size="small"
          /> */}
        </View>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Search")}>
        <View className="mb-4 flex-row items-center bg-white rounded-full px-4 py-2 shadow">
          <Ionicons name="search" size={20} color="gray" />
          <Text className="flex-1 ml-2 text-base py-2">Tìm kiếm</Text>
        </View>
      </TouchableOpacity>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}
