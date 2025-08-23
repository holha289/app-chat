import React, { forwardRef } from "react";
import { FlatList, ListRenderItemInfo, ViewStyle } from "react-native";
import MessageRow, { Message } from "./MessageRow";

type Props = {
  messages: Message[];
  meId?: string | number;
  onScroll?: any;
  onMomentumScrollBegin?: () => void;
  onEndReached?: () => void;
  ListFooterComponent?: React.ReactElement | null;
  contentContainerStyle?: ViewStyle;
  onViewableItemsChanged?: (info: { viewableItems: any[] }) => void;
  viewabilityConfig?: any;
};

const MessageList = forwardRef<FlatList<any>, Props>(function MessageList(
  { messages, meId, onScroll, onMomentumScrollBegin, onEndReached, ListFooterComponent, contentContainerStyle, onViewableItemsChanged, viewabilityConfig },
  ref
) {
  const renderItem = ({ item }: ListRenderItemInfo<Message>) => (
    <MessageRow item={item} meId={meId} />
  );

  return (
    <FlatList
      ref={ref}
      data={messages}
      inverted
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      className="flex-1 px-4"
      contentContainerStyle={contentContainerStyle ?? { paddingTop: 8, paddingBottom: 8 }}
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
