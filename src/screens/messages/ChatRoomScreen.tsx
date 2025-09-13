import React, {
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  replyToMsg,
  selectAttachments,
  selectInputText,
  selectMessage,
  selectMsgStatus,
} from "@app/features/message/msg.selectors";
import msgActions from "@app/features/message/msg.action";
import { selectUser } from "@app/features";
import ChatHeader from "@app/components/chat/ChatHeader";
import MessageList from "@app/components/chat/MessageList";
import InputBar from "@app/components/chat/InputBar";
import { isBefore } from "@app/utils/compare";
import { randomId } from "@app/utils/randomId";
import { MessageItem } from "@app/features/types/msg.type";
import { RootState } from "@app/store";
import UserActions from "@app/features/user/user.action";
import { Friends } from "@app/features/types/contact.type";

type RouteParam = {
  id: string;
  name: string;
  avatar?: string;
  type?: string;
  roomId?: string;
};

const ChatRoomScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const param = route.params as RouteParam;
  const isGroup = param.type === "group";
  const dispatch = useDispatch();
  const getinputText = useSelector((state: RootState) =>
    selectInputText(state, param.id)
  );
  const userInfo = useSelector(selectUser);
  const conversations = useSelector((state: RootState) =>
    selectMessage(state, param.id)
  );
  const reply = useSelector((state: RootState) => replyToMsg(state, param.id));
  const replyIdRef = useRef<string | null>(null);
  const attachments = useSelector((state: RootState) =>
    selectAttachments(state, param.id)
  );
  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    replyIdRef.current = reply?.id ?? null; // luôn sync giá trị mới nhất
    attachmentsRef.current = attachments;
  }, [reply, attachments]);

  const status = useSelector(selectMsgStatus);

  const messages = conversations?.items ?? [];
  const cursor = conversations?.nextCursor ?? null;
  const lastMsgId = conversations?.lastMsgId ?? null;
  const meId = userInfo?.id;

  const listRef = useRef<FlatList<any>>(null);
  const nearBottomRef = useRef(true);

  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(
      () => listRef.current?.scrollToOffset({ offset: 0, animated }),
      50
    );
  }, []);

  const onScroll = useCallback(({ nativeEvent }: any) => {
    nearBottomRef.current = nativeEvent.contentOffset.y < 150;
  }, []);

  const onEndReached = useCallback(() => {
    if (status !== "pending" && cursor) {
      dispatch(msgActions.getMsgByRoom({ roomId: param.id, cursor }));
    }
  }, [cursor, status, dispatch, param.id]);
  useEffect(() => {
    dispatch(msgActions.getMsgByRoom({ roomId: param.id, cursor: null }));
  }, [dispatch, param.id]);

  const [inputText, setInputText] = useState(getinputText || "");
  const sendMsg = useCallback(() => {
    const content = inputText.trim();
    if (attachmentsRef.current.length == 0 ? !content : false) return;
    const sender = {
      fullname: userInfo?.fullname || "",
      avatar: userInfo?.avatar || "",
      slug: userInfo?.slug || "",
      status: "active",
      id: userInfo?.id || "",
    };
    console.log("reply: ", reply);
    const replytoId = replyIdRef.current; // 👈 lấy giá trị mới nhất, không bị stale

    dispatch(
      msgActions.sendMsgByRoom({
        message: {
          roomId: param.id,
          content,
          id: randomId(),
          type: "text",
          replytoId: replytoId,
        },
        attachments: attachmentsRef.current,
        sender: sender,
      })
    );
    dispatch(msgActions.replyToMsg({ roomId: param.id, message: null }));
    dispatch(msgActions.removeAllAttachmentToMsg({ roomId: param.id }));
    setInputText("");
    scrollToBottom();
  }, [dispatch, inputText, param.id, scrollToBottom]);
  useEffect(() => {
    dispatch(msgActions.inputText({ roomId: param.id, text: inputText }));
  }, [inputText]);

  const lastMsgIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const newest = messages?.[0];
    if (!newest || lastMsgIdRef.current === newest.id) return;

    const isMine =
      newest?.sender && "id" in newest.sender
        ? newest.sender.id === meId
        : false;
    if (isMine || nearBottomRef.current) {
      scrollToBottom();
    }
    lastMsgIdRef.current = newest.id;
  }, [messages, meId, scrollToBottom]);

  const ListFooter = useMemo(
    () =>
      status === "pending" ? (
        <ActivityIndicator style={{ marginVertical: 20 }} />
      ) : null,
    [status]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // Item được coi là "visible" khi 50% của nó hiện trên màn hình
  };

  const onViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{
        item: any;
        key: string;
        isViewable: boolean;
        index: number | null;
        section?: any;
      }>;
    }) => {
      // viewableItems là một mảng các item đang hiển thị
      if (viewableItems && viewableItems.length > 0) {
        // Vì list inverted, item đầu tiên là tin nhắn mới nhất đang hiển thị
        const lastSeenMsg = viewableItems[0].item;
        if (
          isBefore(lastMsgId || "", lastSeenMsg?.id) &&
          lastSeenMsg?.sender?.id !== meId
        ) {
          dispatch(
            msgActions.readMark({
              roomId: param.id,
              lastMsgId: lastSeenMsg.id,
            })
          );
          console.log("Tin nhắn cuối cùng đã xem:", lastSeenMsg);
        } // không đánh dấu tin nhắn của mình
        // TODO: Gửi lastSeenMsg.id lên server
        // Ví dụ: dispatch(msgActions.markAsSeen({ roomId: param.id, messageId: lastSeenMsg.id }));
      }
    },
    []
  );
  const onPressCamera = useCallback(() => {
    navigation.navigate("CameraScreen" as never, param as never);
  }, [navigation]);

  const handleCall = async (isVideoCall: boolean) => {
    dispatch(
      UserActions.call({
        from: userInfo as unknown as Friends,
        to: {
          id: param.id,
          fullname: param.name,
          avatar: param.avatar,
        } as unknown as Friends,
        roomId: param.roomId || "",
        isVideoCall: isVideoCall,
        category: "request",
      })
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ChatHeader
          name={param.name}
          avatar={param.avatar}
          type={param.type as string}
          onBack={() => navigation.goBack()}
          onHandleCall={(isVideoCall) => handleCall(isVideoCall)}
        />
        <MessageList
          isGroup={isGroup}
          ref={listRef}
          messages={messages}
          meId={meId}
          onScroll={onScroll}
          onEndReached={onEndReached}
          // onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooter}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          roomId={param.id}
        />
        <InputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={sendMsg}
          replyToMsg={reply || undefined}
          roomdId={param.id}
          isMe={meId === reply?.sender.id}
          onPressCamera={onPressCamera}
          attachments={attachments}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;
