import React from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@app/styles/main.style";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const contacts = [
  { id: "1", name: "Phạm Ánh Sao", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: "2", name: "Lê Thiên Trí", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: "3", name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: "4", name: "Trần B", avatar: "https://i.pravatar.cc/150?img=4" },
];

const ContactScreen = () => {
  const navigation = useNavigation();
  const renderItem = ({ item }: any) => (
    <View className="flex-row items-center px-4 py-3 bg-white mb-2 rounded-xl shadow">
      <Image
        source={{ uri: item.avatar }}
        className="w-12 h-12 rounded-full mr-4"
      />
      <View className="flex-1">
        <Text className="text-lg font-semibold">{item.name}</Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="person-add" size={24} color={colors.color1} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100 pt-14 px-4">
      <TouchableOpacity onPress={() => navigation.navigate("Search")}>
        <View className="mb-4 flex-row items-center bg-white rounded-full px-4 py-2 shadow">
          <Ionicons name="search" size={20} color="gray" />
          <Text className="flex-1 ml-2 text-base py-2">Tìm kiếm bạn bè</Text>
        </View>
      </TouchableOpacity>

      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
};

export default ContactScreen;
