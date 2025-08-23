import React, { memo } from "react";
import { View, Text } from "react-native";
import AvatarMini from "./AvatarMini";

const AVATAR = (name: string) =>
  `https://ui-avatars.com/api/?background=random&size=64&name=${encodeURIComponent(name || "U")}`;

type Sender = { id?: string | number; fullname?: string; avatar?: string };
export type Message = { id: string; content: string; sender?: Sender; createdAt?: string };

type Props = {
  item: Message;
  meId?: string | number;
};

const MessageRow = memo(({ item, meId }: Props) => {
  const isMe = item?.sender?.id === meId;
  const avatarUri =
    item?.sender?.avatar && item.sender.avatar.startsWith("http")
      ? item.sender.avatar
      : AVATAR(item?.sender?.fullname || "U");

  return (
    <View className={`relative my-2 flex-row ${isMe ? "justify-end pr-6" : "justify-start pl-6"}`}>
      <View className={`max-w-[70%] rounded-xl px-4 py-2 ${isMe ? "rounded-br-sm bg-blue-500" : "rounded-bl-sm bg-gray-200"}`}>
        <Text className={`text-base ${isMe ? "text-white" : "text-gray-900"}`}>{item?.content}</Text>
      </View>
      <AvatarMini uri={avatarUri} side={isMe ? "right" : "left"} />
    </View>
  );
});

export default MessageRow;
