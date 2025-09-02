import React, { memo, useState, useCallback, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Clipboard, LayoutAnimation, Platform, UIManager, TouchableWithoutFeedback } from "react-native";
import { Menu } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import AvatarMini from "./AvatarMini";

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AVATAR = (name: string) =>
  `https://ui-avatars.com/api/?background=random&size=64&name=${encodeURIComponent(
    name || "U"
  )}`;

type Sender = { 
  id?: string | number; 
  fullname?: string; 
  avatar?: string;
  isOnline?: boolean; 
};

export type Message = {
  id: string;
  content: string;
  sender?: Sender;
  createdAt?: string;
  messageType?: 'text' | 'image' | 'file' | 'audio' | 'video';
  isRead?: boolean;
  isDelivered?: boolean;
  isSending?: boolean;
  replyTo?: Message;
  reactions?: { emoji: string; count: number; users: string[] }[];
};

type Props = {
  item: Message;
  meId?: string | number;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (message: Message) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onCopy?: (content: string) => void;
  showTimestamp?: boolean;
  showAvatar?: boolean;
  isGroupChat?: boolean;
};

const MessageRow = memo(({ 
  item, 
  meId, 
  onReply,
  onForward, 
  onDelete,
  onEdit,
  onReact,
  onCopy,
  showTimestamp = true,
  showAvatar = true,
  isGroupChat = false
}: Props) => {
  const [visible, setVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const isMe = item?.sender?.id === meId;
  
  const avatarUri = item?.sender?.avatar && item.sender.avatar.startsWith("http")
    ? item.sender.avatar
    : AVATAR(item?.sender?.fullname || "U");

  // Check if message is long
  const isLongMessage = item?.content && item.content.length > 300;
  const shouldTruncate = isLongMessage && !isExpanded;
  
  // Get display content
  const displayContent = shouldTruncate 
    ? item.content.substring(0, 300) + "..."
    : item.content;

  // Popular emojis for quick reaction
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  // Memoized callbacks
  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);
  
  const showEmojiBarWithAnimation = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 200,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.8,
      },
    });
    setShowEmojiBar(true);
    // Auto hide after 8 seconds (increased from 5)
    setTimeout(() => {
      setShowEmojiBar(false);
    }, 8000);
  }, []);

  const hideEmojiBar = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 150,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setShowEmojiBar(false);
  }, []);

  const handleLongPress = useCallback(() => {
    showEmojiBarWithAnimation();
    openMenu();
  }, [showEmojiBarWithAnimation, openMenu]);

  const handleEmojiPress = useCallback((emoji: string) => {
    hideEmojiBar();
    onReact?.(item.id, emoji);
  }, [item.id, onReact, hideEmojiBar]);
  
  const toggleExpanded = useCallback(() => {
    // Animate the layout change
    LayoutAnimation.configureNext({
      duration: 100,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleY,
        springDamping: 0.7,
      },
    });
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleReply = useCallback(() => {
    closeMenu();
    onReply?.(item);
  }, [item, onReply]);

  const handleForward = useCallback(() => {
    closeMenu();
    onForward?.(item);
  }, [item, onForward]);

  const handleDelete = useCallback(() => {
    closeMenu();
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => onDelete?.(item.id)
        }
      ]
    );
  }, [item.id, onDelete]);

  const handleEdit = useCallback(() => {
    closeMenu();
    onEdit?.(item);
  }, [item, onEdit]);

  const handleCopy = useCallback(async () => {
    closeMenu();
    try {
      await Clipboard.setString(item.content);
      onCopy?.(item.content);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [item.content, onCopy]);

  const handleReaction = useCallback((emoji: string) => {
    onReact?.(item.id, emoji);
  }, [item.id, onReact]);

  // Format timestamp
  const formatTime = useCallback((dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  }, []);

  // Render message status icons
  const renderMessageStatus = useCallback(() => {
    if (!isMe) return null;
    
    if (item.isSending) {
      return (
        <View className="flex-row items-center mt-1">
          <Ionicons name="time-outline" size={12} color="#9CA3AF" />
        </View>
      );
    }
    
    if (item.isDelivered && !item.isRead) {
      return (
        <View className="flex-row items-center mt-1">
          <Ionicons name="checkmark-done" size={12} color="#9CA3AF" />
        </View>
      );
    }
    
    if (item.isRead) {
      return (
        <View className="flex-row items-center mt-1">
          <Ionicons name="checkmark-done" size={12} color="#3B82F6" />
        </View>
      );
    }
    
    return (
      <View className="flex-row items-center mt-1">
        <Ionicons name="checkmark" size={12} color="#9CA3AF" />
      </View>
    );
  }, [isMe, item.isSending, item.isDelivered, item.isRead]);

  // Render reply preview
  const renderReplyPreview = useCallback(() => {
    if (!item.replyTo) return null;
    
    return (
      <View className="mb-2 ml-2 border-l-2 border-blue-400 pl-2">
        <Text className="text-xs text-blue-600 font-medium">
          {item.replyTo.sender?.fullname || 'Unknown'}
        </Text>
        <Text className="text-sm text-gray-600" numberOfLines={2}>
          {item.replyTo.content}
        </Text>
      </View>
    );
  }, [item.replyTo]);

  // Render reactions
  const renderReactions = useCallback(() => {
    if (!item.reactions?.length) return null;
    
    return (
      <View className="flex-row flex-wrap mt-1 gap-1">
        {item.reactions.map((reaction, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleReaction(reaction.emoji)}
            className="flex-row items-center bg-gray-100 rounded-full px-2 py-1"
          >
            <Text className="text-xs">{reaction.emoji}</Text>
            {reaction.count > 1 && (
              <Text className="text-xs ml-1 text-gray-600">
                {reaction.count}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [item.reactions, handleReaction]);

  // Render quick emoji bar
  const renderEmojiBar = useCallback(() => {
    if (!showEmojiBar) return null;
    
    return (
      <TouchableWithoutFeedback onPress={hideEmojiBar}>
        <View 
          className="absolute inset-0 z-50"
          style={{ 
            backgroundColor: 'transparent',
          }}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View 
              className={`absolute z-50 ${
                isMe ? 'right-0' : 'left-0'
              } -top-12 bg-white rounded-full px-3 py-2 shadow-lg border border-gray-200`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center gap-2">
                {quickEmojis.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleEmojiPress(emoji)}
                    className="w-8 h-8 items-center justify-center rounded-full active:bg-gray-100"
                    activeOpacity={0.7}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    <Text className="text-lg">{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    );
  }, [showEmojiBar, isMe, quickEmojis, handleEmojiPress, hideEmojiBar]);
  return (
    <View
      className={`relative my-1 flex-row items-end ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar for non-me messages */}
      {!isMe && showAvatar && (
        <View className="mr-5">
          <AvatarMini 
            uri={avatarUri} 
            side="left"
          />
        </View>
      )}

      {/* Message container */}
      <View className={`flex-1 relative ${isMe ? 'items-end' : 'items-start'}`}>
        {/* Quick emoji bar */}
        {renderEmojiBar()}
        
        {/* Sender name for group chats */}
        {!isMe && isGroupChat && (
          <Text className="text-xs text-gray-600 ml-3 mb-1">
            {item.sender?.fullname || 'Unknown'}
          </Text>
        )}

        {/* Main message bubble with Menu */}
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          contentStyle={{
            backgroundColor: 'white',
            borderRadius: 8,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
          anchor={
            <TouchableOpacity
              onLongPress={handleLongPress}
              delayLongPress={200}
              activeOpacity={0.8}
              disabled={showEmojiBar}
              className={`rounded-2xl px-4 py-2 ${
                isMe 
                  ? "rounded-br-md bg-blue-500 shadow-sm mr-1 ml-6" 
                  : "rounded-bl-md bg-white border border-gray-200 shadow-sm ml-1 mr-6"
              }`}
            >
              {renderReplyPreview()}
              
              {/* Message content */}
              <Text selectable={false}
                className={`text-base leading-5 ${
                  isMe ? "text-white" : "text-gray-900"
                }`}
                
              >
                {displayContent}
              </Text>
              
              {/* Show more/less button for long messages */}
              {isLongMessage && (
                <TouchableOpacity 
                  onPress={toggleExpanded}
                  className="mt-2 self-start"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <View className={`flex-row items-center px-2 py-1 rounded-full ${
                    isMe ? "bg-blue-400" : "bg-gray-100"
                  }`}>
                    <Text
                      className={`text-xs font-medium mr-1 ${
                        isMe ? "text-white" : "text-blue-600"
                      }`}
                    >
                      {isExpanded ? "Thu gọn" : "Xem thêm"}
                    </Text>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={12} 
                      color={isMe ? "#ffffff" : "#2563eb"} 
                    />
                  </View>
                </TouchableOpacity>
              )}
              
              {/* Message metadata */}
              <View className={`flex-row items-center justify-between ${
                isLongMessage ? 'mt-2' : 'mt-1'
              } ${
                isMe ? 'justify-end' : 'justify-start'
              }`}>
                {showTimestamp && (
                  <Text className={`text-xs ${
                    isMe ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(item.createdAt)}
                  </Text>
                )}
                
                {renderMessageStatus()}
              </View>
            </TouchableOpacity>
          }
        >
          <Menu.Item 
            onPress={handleReply}
            title="Reply" 
            leadingIcon="reply"
          />
          <Menu.Item 
            onPress={handleCopy}
            title="Copy" 
            leadingIcon="content-copy"
          />
          <Menu.Item 
            onPress={handleForward}
            title="Forward" 
            leadingIcon="share"
          />
          {isMe && (
            <Menu.Item 
              onPress={handleEdit}
              title="Edit" 
              leadingIcon="pencil"
            />
          )}
          <Menu.Item 
            onPress={handleDelete}
            title="Delete" 
            leadingIcon="delete"
            titleStyle={{ color: '#EF4444' }}
          />
        </Menu>

        {renderReactions()}
      </View>

      {/* Avatar for me messages */}
      {isMe && showAvatar && (
        <View className="ml-5">
          <AvatarMini 
            uri={avatarUri} 
            side="right"
          />
        </View>
      )}
    </View>
  );
});

MessageRow.displayName = 'MessageRow';

export default MessageRow;
