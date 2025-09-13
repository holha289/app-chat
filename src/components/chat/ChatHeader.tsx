import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';


const AVATAR = (name: string) =>
  `https://ui-avatars.com/api/?background=random&size=64&name=${encodeURIComponent(
    name || "U"
  )}`;

type Props = {
  name: string;
  avatar?: string;
  onBack: () => void;
};

export default function ChatHeader({ name, avatar, onBack }: Props) {
  return (
    <View className=" flex-row items-center border-b border-gray-200 px-4 py-3">
      <TouchableOpacity className="h-10 w-10" onPress={onBack}>
        <Ionicons name="arrow-back-outline" size={24} color="#111827" />
      </TouchableOpacity>
      <Image
        source={{ uri: avatar || AVATAR(name) }}
        className="mr-3 h-10 w-10 rounded-full"
      />
      <Text className="flex-1 text-lg font-semibold">{name}</Text>
      <TouchableOpacity>
        <Ionicons name="call-outline" size={24} color="#10B981" />
      </TouchableOpacity>
    </View>
  );
}
