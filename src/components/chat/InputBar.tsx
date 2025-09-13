import React from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
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
  // const [images, setImages] = React.useState<import("react-native-image-picker").Asset[]>([]);
  // const [resultMedia, setResultMedia] = React.useState<import("react-native-image-picker").Asset[]>([]);
  const CloseTyping = () => {
    setTyping(false);
  };
  const onPress = () => {
    console.log("Pressed!");
    dispatch(msgActions.replyToMsg({ roomId: roomdId || "", message: null }));
  };
  const onPressCamera = async () => {
    // const result = await launchCamera({ mediaType: 'mixed',   // ✅ cho phép cả ảnh & video
    // videoQuality: 'high', // tùy chọn: 'low', 'medium', 'high'
    // durationLimit: 60,    // tùy chọn: giới hạn 60 giây cho video
    // saveToPhotos: true,   // lưu vào gallery }, (response) => {
    //   // handle response if needed
    //   // Example: setImages(response.assets || []);
    // });
    // setResultMedia([...(result.assets || [])]);
    // console.log("🚀 ~ onPressCamera ~ result:", resultMedia);
  };
  const onPressLibrary = async () => {
    // const result = await launchImageLibrary({ mediaType: "mixed" }, (response) => {
    //   // handle response if needed
    //   // Example: setImages(response.assets || []);
    // });
    // setResultMedia([...(result.assets || [])]);
    // console.log("🚀 ~ onPressLibrary ~ result:", resultMedia);
  };
  return (
    <View className="flex items-center w-full  border-t border-gray-100">
      {replyToMsg?.id && (
        <View className="w-full h-15  bg-gray-200 flex-row items-start ">
          <View className="flex-1 p-2">
            <Text className="text-xs ">
              Trả lời {isMe ? "tôi" : replyToMsg?.sender.fullname}
            </Text>
            <Text className="">
              {replyToMsg?.content.slice(0, 100)}
              {replyToMsg?.content.length > 100 ? "..." : ""}
            </Text>
          </View>
          <View>
            <TouchableOpacity className="p-5" onPress={onPress}>
              <Ionicons name="close" size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View className="flex-row items-center gap-2   bg-white px-4 py-2">
        <TouchableOpacity onPress={onPressCamera}>
          <Ionicons name="camera" size={24} color={colors.color1} />
        </TouchableOpacity>
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
