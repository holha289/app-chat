import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const conversations = [
  {
    id: "1",
    name: "Ánh Sao 😚",
    avatar: "https://i.pravatar.cc/150?img=5",
    lastMessage: "Tối đi chơi nhaa?",
    time: "2 phút trước",
    unread: true,
  },
  {
    id: "2",
    name: "Trí đẹp trai",
    avatar: "https://i.pravatar.cc/150?img=8",
    lastMessage: "Code xong chưa bro?",
    time: "1 giờ trước",
    unread: false,
  },
  {
    id: "3",
    name: "Dev Team 69",
    avatar: "https://i.pravatar.cc/150?img=11",
    lastMessage: "Review PR lẹ đi 😤",
    time: "Hôm qua",
    unread: true,
  },
];

export default function ChatListScreen() {
  const navigation = useNavigation();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm"
      onPress={() => navigation.navigate("ChatRoom", { userId: item.id })}
    >
      <Image
        source={{ uri: item.avatar }}
        className="w-14 h-14 rounded-full mr-4"
      />
      <View className="flex-1">
        <View className="flex-row justify-between mb-1">
          <Text className="font-semibold text-base">{item.name}</Text>
          <Text className="text-xs text-gray-400">{item.time}</Text>
        </View>
        <Text
          numberOfLines={1}
          className={`text-sm ${
            item.unread ? "font-bold text-black" : "text-gray-500"
          }`}
        >
          {item.lastMessage}
        </Text>
      </View>
      {item.unread && <View className="w-2 h-2 bg-red-500 rounded-full ml-2" />}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 pt-16 px-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-3xl font-extrabold text-blue-600">WChat</Text>
        <Ionicons name="create-outline" size={24} color="#3b82f6" />
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Search")}>
        <View className="mb-4 flex-row items-center bg-white rounded-full px-4 py-2 shadow">
          <Ionicons name="search" size={20} color="gray" />
          <Text className="flex-1 ml-2 text-base py-2">Tìm kiếm</Text>
        </View>
      </TouchableOpacity>
      {/* <View className="flex-row justify-between items-center mb-4">
        <Text className="text-3xl font-bold">Tin nhắn</Text>
        <Ionicons name="create-outline" size={24} color="#3b82f6" />
      </View> */}

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
