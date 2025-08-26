import React, {
  useCallback,
  useEffect,
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
  selectMessage,
  selectMsgStatus,
} from "@app/features/message/msg.selectors";
import msgActions from "@app/features/message/msg.action";
import { selectUser } from "@app/features";
import { useSockerIo } from "@app/hooks/use-socketio";
import ChatHeader from "@app/components/chat/ChatHeader";
import MessageList from "@app/components/chat/MessageList";
import InputBar from "@app/components/chat/InputBar";
import { isBefore } from "@app/utils/compare";

type RouteParam = { id: string; name: string; avatar?: string };

const ChatRoomScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const param = route.params as RouteParam;

  const { socket } = useSockerIo();
  const dispatch = useDispatch();

  const userInfo = useSelector(selectUser);
  const conversations = useSelector(selectMessage);
  const status = useSelector(selectMsgStatus);

  const messages = conversations[param.id]?.items ?? [];
  const cursor = conversations[param.id]?.nextCursor ?? null;
  const lastMsgId = conversations[param.id]?.lastMsgId ?? null;
  const meId = userInfo?.id;

  const listRef = useRef<FlatList<any>>(null);
  const nearBottomRef = useRef(true);

  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(
      () => listRef.current?.scrollToOffset({ offset: 0, animated }),
      50,
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

  const socketHandler = useCallback(
    (payload: any) => {
      const m = payload?.metadata?.message;
      if (!m || !param.id) return;
      dispatch(msgActions.reciverMsg({ roomId: param.id, message: m }));
      const msg = {
        msg_id: m?.id,
        createdAt: m?.createdAt,
        msg_content: m?.content,
      };
      dispatch(msgActions.updateLastMsg({ roomId: param.id, message: msg }));
    },
    [dispatch, param.id],
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("room:sended:message", socketHandler);
    return () => {
      socket.off("room:sended:message", socketHandler);
    };
  }, [socket, socketHandler]);

  useEffect(() => {
    dispatch(msgActions.getMsgByRoom({ roomId: param.id, cursor: null }));
  }, [dispatch, param.id]);

  const [inputText, setInputText] = useState("");
  const sendMsg = useCallback(() => {
    const content = inputText.trim();
    if (!content) return;
    dispatch(
      msgActions.sendMsgByRoom({ roomId: param.id, content, type: "text" }),
    );
    setInputText("");
    scrollToBottom();
  }, [dispatch, inputText, param.id, scrollToBottom]);

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
    [status],
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
        if (isBefore(lastMsgId || "", lastSeenMsg?.id)) {
          dispatch(
            msgActions.readMark({
              roomId: param.id,
              lastMsgId: lastSeenMsg.id,
            }),
          );
          console.log("Tin nhắn cuối cùng đã xem:", lastSeenMsg);
        } // không đánh dấu tin nhắn của mình
        // TODO: Gửi lastSeenMsg.id lên server
        // Ví dụ: dispatch(msgActions.markAsSeen({ roomId: param.id, messageId: lastSeenMsg.id }));
      }
    },
    [],
  );
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
          onBack={() => navigation.goBack()}
        />
        <MessageList
          ref={listRef}
          messages={messages}
          meId={meId}
          onScroll={onScroll}
          onEndReached={onEndReached}
          // onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooter}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
        <InputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={sendMsg}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;
