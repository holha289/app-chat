import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
};

export default function InputBar({ value, onChangeText, onSend }: Props) {
  return (
    <View className="flex-row items-center border-t border-gray-200 bg-white px-4 py-2">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Nhập tin nhắn..."
        className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-base"
        placeholderTextColor="gray"
        returnKeyType="send"
        onSubmitEditing={onSend}
      />
      <TouchableOpacity className="ml-3" onPress={onSend}>
        <Ionicons name="send" size={24} color="#10B981" />
      </TouchableOpacity>
    </View>
  );
}
