import React from "react";
import { View, Text } from "react-native";

type MessageBubbleProps = {
  item: any;
  isMe: boolean;
};

const MessageBubble = ({ item, isMe }: MessageBubbleProps) => {
  return (
    <View
      className={`flex-row my-2 ${isMe ? "justify-end" : "justify-start"}`}
    >
      <View
        className={`max-w-[70%] px-4 py-2 rounded-xl ${
          isMe
            ? "bg-blue-500 rounded-br-none"
            : "bg-gray-200 rounded-bl-none"
        }`}
      >
        <Text className={`text-base ${isMe ? "text-white" : "text-gray-900"}`}>
          {item.content}
        </Text>
      </View>
    </View>
  );
};

export default MessageBubble;
