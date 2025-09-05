import React, { forwardRef } from "react";
import { FlatList, ListRenderItemInfo, ViewStyle } from "react-native";
import MessageRow from "./MessageRow";
import { MessageItem } from "@app/features/types/msg.type";

type Props = {
  messages: MessageItem[];
  meId?: string | number;
  onScroll?: any;
  roomdId?: string;
  isGroup?: boolean;
  onMomentumScrollBegin?: () => void;
  onEndReached?: () => void;
  ListFooterComponent?: React.ReactElement | null;
  contentContainerStyle?: ViewStyle;
  onViewableItemsChanged?: (info: { viewableItems: any[] }) => void;
  viewabilityConfig?: any;
};

const MessageList = forwardRef<FlatList<any>, Props>(function MessageList(
  {
    isGroup,
    messages,
    roomdId,
    meId,
    onScroll,
    onMomentumScrollBegin,
    onEndReached,
    ListFooterComponent,
    contentContainerStyle,
    onViewableItemsChanged,
    viewabilityConfig,
  },

  ref
) {
  console.log("🚀 ~ roomdId:", roomdId);
  const renderItem = ({ item }: ListRenderItemInfo<MessageItem>) => (
    <MessageRow
      isGroupChat={isGroup}
      roomdId={roomdId}
      item={item}
      meId={meId}
    />
  );

  return (
    <FlatList
      ref={ref}
      data={messages}
      inverted
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      className="flex-1 px-4"
      contentContainerStyle={
        contentContainerStyle ?? { paddingTop: 8, paddingBottom: 8 }
      }
      maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
      onMomentumScrollBegin={onMomentumScrollBegin}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.1}
      onScroll={onScroll}
      scrollEventThrottle={16}
      ListFooterComponent={ListFooterComponent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      removeClippedSubviews
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
    />
  );
});

export default MessageList;
