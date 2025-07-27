import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "@app/styles/main.style";

const MOCK_DATA = [
  { id: "1", name: "Phạm Ánh Sao", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: "2", name: "Lê Thiên Trí", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: "3", name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: "4", name: "Trần B", avatar: "https://i.pravatar.cc/150?img=4" },
];

const SearchScreen = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");

  const filtered = MOCK_DATA.filter((user) =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );

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
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          className="ml-3 flex-1 bg-white px-4 py-2 rounded-full shadow"
          placeholder="Tìm kiếm"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Kết quả */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default SearchScreen;
