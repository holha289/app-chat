// MessageRow.tsx
import React, { memo, useCallback } from "react";
import { View, Text, Pressable, Vibration, Appearance } from "react-native";
import AvatarMini from "./AvatarMini";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Ionicons } from '@expo/vector-icons';
const AVATAR = (name: string) =>
  `https://ui-avatars.com/api/?background=random&size=64&name=${encodeURIComponent(name || "U")}`;

type Sender = { id?: string | number; fullname?: string; avatar?: string };
export type Message = { id: string; content: string; sender?: Sender; createdAt?: string };
const actionFont=18
type Props = {
  item: Message;
  meId?: string | number;
  onReply?: (m: Message) => void;
  onDelete?: (m: Message) => void;
  onForward?: (m: Message) => void;
  onPin?: (m: Message) => void;
};

const MessageRow = memo(({ item, meId, onReply, onDelete, onForward, onPin }: Props) => {
  const isMe = item?.sender?.id === meId;
  const avatarUri =
    item?.sender?.avatar && item.sender.avatar.startsWith("http")
      ? item.sender.avatar
      : AVATAR(item?.sender?.fullname || "U");

  const { showActionSheetWithOptions } = useActionSheet();

  const handleLongPress = useCallback((payload:Message) => {
    Vibration.vibrate(10);
    const options = isMe
      ? ["Trả lời", "Sao chép", "Chuyển tiếp", "Ghim", "Xoá", "Đóng"]
      : ["Trả lời", "Sao chép", "Chuyển tiếp", "Ghim", "Đóng"];

    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = isMe ? options.indexOf("Xoá") : undefined;
    // icons hiển thị ngang với text
    const icons = [
      <Ionicons name="arrow-undo-outline" size={actionFont} color="#444" />,
      <Ionicons name="copy-outline" size={actionFont} color="#444" />,
      <Ionicons name="arrow-redo-outline" size={actionFont} color="#444" />,
      <Ionicons name="pin-outline" size={actionFont} color="#444" />,
      isMe ? <Ionicons name="trash-outline" size={actionFont} color="red" /> : null,
      <Ionicons name="close" size={actionFont} color="#444" />,
    ].filter(Boolean); // xoá null nếu không phải isMe
    const colorScheme = Appearance.getColorScheme();
    showActionSheetWithOptions(
      {
        options,
        icons,
        cancelButtonIndex,
        destructiveButtonIndex,
        
        // Style phù hợp NativeWindUI gợi ý
        containerStyle: { backgroundColor: colorScheme === "dark" ? "black" : "white" },
        textStyle: {fontSize:actionFont, color: colorScheme === "dark" ? "white" : "black", lineHeight:actionFont*2},
        // optional: title & message
        // title: "Tùy chọn tin nhắn",
        // message: payload.content.slice(0, 100),
      },
      (selectedIndex) => {
        const label = options[selectedIndex ?? cancelButtonIndex];
        switch (label) {
          case "Trả lời":
            onReply?.(item);
            break;
          case "Sao chép":
            // tuỳ bạn dùng Clipboard lib nào
            // Clipboard.setString(item?.content ?? "");
            break;
          case "Chuyển tiếp":
            onForward?.(item);
            break;
          case "Ghim":
            onPin?.(item);
            break;
          case "Xoá":
            onDelete?.(item);
            break;
          default:
            // Đóng / Cancel
            break;
        }
      }
    );
  }, [item, isMe, onReply, onDelete, onForward, onPin, showActionSheetWithOptions]);

  return (
    <View className={`relative my-2 flex-row ${isMe ? "justify-end pr-6" : "justify-start pl-6"}`}>
      <Pressable  onLongPress={() => handleLongPress(item)} delayLongPress={250}>
        <View
          className={` rounded-xl px-4 py-2 ${
            isMe ? "rounded-br-sm bg-blue-500 ms-10" : "rounded-bl-sm bg-gray-200  mr-10"
          }`}
        >
          <Text className={`text-base ${isMe ? "text-white" : "text-gray-900"}`}>{item?.content}</Text>
        </View>
      </Pressable>
      <AvatarMini uri={avatarUri} side={isMe ? "right" : "left"} />
    </View>
  );
});

export default MessageRow;
