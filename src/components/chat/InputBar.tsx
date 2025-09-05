import React from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MessageItem } from "@app/features/types/msg.type";
import { useDispatch } from "react-redux";
import msgActions from "@app/features/message/msg.action";
import { colors } from "@app/styles/main.style";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  replyToMsg?: MessageItem;
  isMe?: boolean;
  roomdId?: string;
};

export default function InputBar({
  value,
  onChangeText,
  onSend,
  replyToMsg,
  isMe,
  roomdId,
}: Props) {
  const dispatch = useDispatch();
  const [typing, setTyping] = React.useState(false);
  const Ontyping = () => {
    setTyping(true);
  };
  const CloseTyping = () => {
    setTyping(false);
  };
  const onPress = () => {
    console.log("Pressed!");
    dispatch(msgActions.replyToMsg({ roomId: roomdId || "", message: null }));
  };
  return (
    <View className="flex items-center w-full  border-t border-gray-100">
      {replyToMsg?.id && (
        <View className="w-full h-15  bg-gray-200 flex-row items-start ">
          <View className="flex-1 p-2">
            <Text className="text-xs ">
              Trả lời {isMe ? "tôi" : replyToMsg?.sender.fullname}
            </Text>
            <Text className="">{replyToMsg?.content.slice(0, 100)}{replyToMsg?.content.length>100?"...":""}</Text>
          </View>
          <View>
            <TouchableOpacity className="p-5" onPress={onPress}>
              <Ionicons name="close" size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View className="flex-row items-center gap-2   bg-white px-4 py-2">
        <Ionicons name="camera" size={24} color={colors.color1} />
        <Ionicons name="image" size={24} color={colors.color1} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Nhập tin nhắn..."
          className="flex-1 rounded-full bg-gray-300 px-4 py-2 text-base"
          placeholderTextColor="gray"
          returnKeyType="send"
          onSubmitEditing={onSend}
          onFocus={Ontyping}
          onBlur={CloseTyping}
        />
        <TouchableOpacity className="ml-3" onPress={onSend}>
          <Ionicons name="send" size={24} color={colors.color1} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
