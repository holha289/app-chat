import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { classText, colors } from "@app/styles/main.style";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import {
  selectMessage,
  selectMsgStatus,
} from "@app/features/message/msg.selectors";
import { useSelector } from "react-redux";
import msgActions from "@app/features/message/msg.action";
import { selectUser } from "@app/features";

// const messages = [
//   { id: "1", text: "Chào cậu, đang làm gì đó?", fromMe: false },
//   { id: "2", text: "Tớ đang học React Native nè!", fromMe: true },
//   { id: "3", text: "Ghê dữ! Gửi link repo coi?", fromMe: false },
// ];

const ChatRoomScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const param = route.params;
  const userInfo = useSelector(selectUser);
  const [inputText, setInputText] = useState("");
  const conversations = useSelector(selectMessage)[param.id] ?? []; // 🔥 lấy trực tiếp từ store
  const messages = conversations.items;
  const status = useSelector(selectMsgStatus); // để biết đang loading

  const refreshing = status === "pending";

  const onRefresh = useCallback(() => {
    dispatch(
      msgActions.getMsgByRoom({
        roomId: param.id,
        cursor: conversations.nextCursor,
      }),
    ); // thunk/saga sẽ cập nhật store
  }, [dispatch]);

  useEffect(() => {
    onRefresh(); // load lần đầu
  }, [onRefresh]);
  const renderItem = ({ item }: any) => (
    <View
      className={`flex-row my-2 ${
        item.senderId === userInfo?.id ? "justify-end" : "justify-start"
      }`}
    >
      <View
        className={`max-w-[70%] px-4 py-2 rounded-xl ${
          item.senderId === userInfo?.id
            ? "bg-blue-500 rounded-br-none"
            : "bg-gray-200 rounded-bl-none"
        }`}
      >
        <Text
          className={`text-base ${
            item.fromMe ? "text-white" : "text-gray-900"
          }`}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="flex-row items-center mt-10 px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          className=" w-10 h-10"
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons
            name="arrow-back-outline"
            size={24}
            color={classText.black}
          />
        </TouchableOpacity>
        <Image
          source={{ uri: param.avatar }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <Text className="text-lg font-semibold flex-1">{param.name}</Text>
        <TouchableOpacity>
          <Ionicons name="call-outline" size={24} color={colors.color1} />
        </TouchableOpacity>
      </View>

      {/* Chat list */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        className="px-4 flex-1"
        // inverted // đảo ngược tin nhắn để nhắn mới hiện ở dưới
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Input */}
      <View className="flex-row items-center px-4 py-2 border-t border-gray-200 bg-white">
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-base"
          placeholderTextColor={"gray"}
        />
        <TouchableOpacity className="ml-3">
          <Ionicons name="send" size={24} color={colors.color1} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoomScreen;
