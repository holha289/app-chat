import React, { useCallback, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Attachment, MessageItem } from "@app/features/types/msg.type";
import { useDispatch } from "react-redux";
import msgActions from "@app/features/message/msg.action";
import { colors } from "@app/styles/main.style";
import { Video } from "react-native-video";
import { PreviewMedia } from "../PreviewMedia";
import { MediaSelect } from "./MediaSelect";
type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  replyToMsg?: MessageItem;
  isMe?: boolean;
  roomdId?: string;
  onPressCamera?: () => void;
  onPressLibrary?: () => void;
  attachments?: Attachment[];
};

export default function InputBar({
  value,
  onChangeText,
  onSend,
  replyToMsg,
  isMe,
  roomdId,
  attachments,
  onPressCamera,
  onPressLibrary,
}: Props) {
  console.log("🚀 ~ InputBar ~ attachments:", attachments);
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
  const onPressRemoveAtt = useCallback(
    (index: number) => {
      dispatch(
        msgActions.removeAttachmentToMsg({ roomId: roomdId || "", index })
      );
    },
    [dispatch]
  );
  const [showMediaSelect, setShowMediaSelect] = useState<boolean>(false);
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
      {attachments && attachments.length > 0 && (
        <View className="w-full max-h-20  bg-gray-200 flex-row items-start px-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center", paddingVertical: 4 }}
          >
            {attachments.map((att, index) => (
              <View
                key={att.url}
                className="mr-2 border border-gray-400 rounded"
              >
                {att.url && (
                  <PreviewMedia
                    uri={att.url}
                    kind={att.kind}
                    classButton="w-16 h-16 rounded"
                    isRemove={true}
                    onRemove={() => onPressRemoveAtt(index)}
                  />
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View className="flex-row items-center gap-2   bg-white px-4 py-2">
        <TouchableOpacity onPress={onPressCamera}>
          <Ionicons name="camera" size={24} color={colors.color1} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowMediaSelect(true)}>
          <Ionicons name="image" size={24} color={colors.color1} />
        </TouchableOpacity>
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
      <MediaSelect
        roomId={roomdId || ""}
        isShow={showMediaSelect}
        onClose={() => setShowMediaSelect(false)}
      />
    </View>
  );
}
