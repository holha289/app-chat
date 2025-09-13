import React, { memo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  Image,
  ScrollView,
  Modal,
  Dimensions,
  SafeAreaView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Video from "react-native-video";
import AvatarMini from "./AvatarMini";
import { MsgMdEvent } from "./MessageModelEvent";
import { useDispatch } from "react-redux";
import msgActions from "@app/features/message/msg.action";
import { MessageItem, Attachment } from "@app/features/types/msg.type";
import Clipboard from "@react-native-clipboard/clipboard";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
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

type Props = {
  item: MessageItem;
  meId?: string | number;
  showTimestamp?: boolean;
  showAvatar?: boolean;
  isGroupChat?: boolean;
  onLongPress?: () => void;
  roomId?: string;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Component xem video fullscreen với trạng thái play/pause
const VideoFullscreenViewer = memo(
  ({ uri, onClose }: { uri: string; onClose: () => void }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);

    return (
      <View
        style={{
          width: screenWidth,
          height: screenHeight - 120,
          maxHeight: screenHeight - 120,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {isPlaying ? (
          <Video
            source={{ uri }}
            style={{
              width: screenWidth,
              height: screenHeight - 120,
            }}
            resizeMode="contain"
            controls={showControls}
            paused={false}
            repeat={false}
            playInBackground={false}
            playWhenInactive={false}
            onError={(error) => {
              console.log("Video Error:", error);
              setIsPlaying(false);
            }}
            onLoad={(data) => console.log("Video Loaded:", data)}
            onEnd={() => setIsPlaying(false)}
          />
        ) : (
          <TouchableOpacity
            style={{
              width: screenWidth,
              height: screenHeight - 120,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "black",
            }}
            onPress={() => setIsPlaying(true)}
          >
            <Image
              source={{ uri }}
              style={{
                width: screenWidth,
                height: screenHeight - 120,
              }}
              resizeMode="contain"
            />
            <View
              style={{
                position: "absolute",
                justifyContent: "center",
                alignItems: "center",
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "rgba(0,0,0,0.7)",
              }}
            >
              <Ionicons name="play" size={40} color="white" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

// Modal hiển thị toàn bộ attachments
const AttachmentModal = memo(
  ({
    visible,
    attachments,
    onClose,
    isMe,
  }: {
    visible: boolean;
    attachments: Attachment[];
    onClose: () => void;
    isMe: boolean;
  }) => {
    const [selectedMedia, setSelectedMedia] = useState<{
      uri: string;
      kind: string;
    } | null>(null);

    const formatFileSize = (bytes?: number) => {
      if (!bytes) return "";
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return (
        Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
      );
    };

    const formatDuration = (duration?: number) => {
      if (!duration) return "";
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const calculateImageSize = (width?: number, height?: number) => {
      if (!width || !height) return { width: 120, height: 120 };

      const maxSize = 120;
      const ratio = Math.min(maxSize / width, maxSize / height);

      return {
        width: width * ratio,
        height: height * ratio,
      };
    };

    return (
      <>
        {/* Modal hiển thị toàn bộ attachments */}
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
          <View className="flex-1 bg-white overflow-hidden">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">
                Tất cả đính kèm ({attachments.length})
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 p-4 overflow-hidden">
              <View className="flex-row flex-wrap gap-2 overflow-hidden pt-2">
                {attachments.map((attachment, index) => {
                  // Image
                  if (
                    attachment.kind === "photo" ||
                    attachment.kind === "image"
                  ) {
                    const imageSize = calculateImageSize(
                      attachment.width,
                      attachment.height
                    );
                    return (
                      <TouchableOpacity
                        key={attachment.id || index}
                        style={imageSize}
                        className="rounded-lg mb-2"
                        onPress={() =>
                          setSelectedMedia({
                            uri: attachment.url,
                            kind: "image",
                          })
                        }
                      >
                        <Image
                          source={{ uri: attachment.url }}
                          style={imageSize}
                          className="rounded-lg"
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    );
                  }

                  // Video
                  if (attachment.kind === "video") {
                    return (
                      <TouchableOpacity
                        key={attachment.id || index}
                        style={{
                          width: 120,
                          height: 120,
                          overflow: "hidden", // Quan trọng: ngăn video tràn
                          borderRadius: 8,
                        }}
                        className="mb-2 border-2 border-red-500 bg-gray-200"
                        onPress={() =>
                          setSelectedMedia({
                            uri: attachment.url,
                            kind: "video",
                          })
                        }
                      >
                        <Video
                          source={{ uri: attachment.url }}
                          style={{
                            width: 120,
                            height: 120,
                            // // position: "absolute",
                            // top: 0,
                            // left: 0,
                          }}
                          resizeMode="cover"
                          paused={true}
                          poster={attachment.url}
                          // posterResizeMode="cover"
                        />
                        <View
                          className="absolute inset-0 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                        >
                          <Ionicons
                            name="play-circle"
                            size={32}
                            color="white"
                          />
                        </View>
                        <View
                          className="absolute bottom-2 left-2 rounded px-2 py-1"
                          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
                        >
                          <Text className="text-white text-xs">
                            {formatDuration(attachment.duration)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }

                  // File
                  if (attachment.kind === "file") {
                    return (
                      <View
                        key={attachment.id || index}
                        className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 mb-2"
                      >
                        <View className="flex-row items-center">
                          <Ionicons
                            name="document-outline"
                            size={24}
                            color="#374151"
                          />
                          <View className="flex-1 ml-3">
                            <Text
                              className="font-medium text-gray-900"
                              numberOfLines={1}
                            >
                              {attachment.name || "Untitled File"}
                            </Text>
                            <Text className="text-xs text-gray-600">
                              {formatFileSize(attachment.size)} •{" "}
                              {attachment.mimetype || "Unknown type"}
                            </Text>
                          </View>
                          <Ionicons
                            name="download-outline"
                            size={20}
                            color="#6B7280"
                          />
                        </View>
                      </View>
                    );
                  }

                  return null;
                })}
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Modal xem media fullscreen */}
        {selectedMedia && (
          <Modal
            visible={true}
            animationType="fade"
            onRequestClose={() => setSelectedMedia(null)}
          >
            <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  zIndex: 10,
                  padding: 8,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 20,
                }}
                onPress={() => setSelectedMedia(null)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>

              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: 60,
                  paddingBottom: 20,
                  paddingHorizontal: 0,
                }}
              >
                {selectedMedia.kind === "image" ? (
                  <Image
                    source={{ uri: selectedMedia.uri }}
                    style={{
                      width: screenWidth,
                      height: screenHeight - 120,
                      maxHeight: screenHeight - 120,
                    }}
                    resizeMode="contain"
                  />
                ) : (
                  <VideoFullscreenViewer
                    uri={selectedMedia.uri}
                    onClose={() => setSelectedMedia(null)}
                  />
                )}
              </View>
            </SafeAreaView>
          </Modal>
        )}
      </>
    );
  }
);

// Component hiển thị attachments với preview giới hạn
const AttachmentRenderer = memo(
  ({ attachments, isMe }: { attachments: Attachment[]; isMe: boolean }) => {
    const [showModal, setShowModal] = useState(false);

    if (!attachments || attachments.length === 0) return null;

    const previewLimit = 3;
    const hasMore = attachments.length > previewLimit;
    const previewAttachments = attachments.slice(0, previewLimit);
    const remainingCount = attachments.length - previewLimit;

    const formatFileSize = (bytes?: number) => {
      if (!bytes) return "";
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return (
        Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
      );
    };

    const formatDuration = (duration?: number) => {
      if (!duration) return "";
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const calculateImageSize = (width?: number, height?: number) => {
      if (!width || !height) return { width: 64, height: 64 };

      const maxSize = 64;
      const ratio = Math.min(maxSize / width, maxSize / height);

      return {
        width: width * ratio,
        height: height * ratio,
      };
    };

    return (
      <>
        <View
          className={`mt-2 ${
            isMe ? "justify-end ml-10" : "justify-start mr-10"
          } flex-1`}
        >
          <View className="flex-row flex-wrap gap-2">
            {previewAttachments.map((attachment, index) => {
              // Photo/Image
              if (attachment.kind === "photo" || attachment.kind === "image") {
                const imageSize = calculateImageSize(
                  attachment.width,
                  attachment.height
                );
                return (
                  <TouchableOpacity
                    key={attachment.id || index}
                    style={imageSize}
                    className="rounded-lg mb-2"
                    onPress={() => setShowModal(true)}
                  >
                    <Image
                      source={{ uri: attachment.url }}
                      style={imageSize}
                      className="rounded-lg"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              }

              // Video
              if (attachment.kind === "video") {
                return (
                  <TouchableOpacity
                    key={attachment.id || index}
                    style={{
                      width: 64,
                      height: 64,
                      overflow: "hidden",
                      borderRadius: 8,
                    }}
                    className="mb-2 relative bg-gray-200"
                    onPress={() => setShowModal(true)}
                  >
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        overflow: "hidden",
                        borderRadius: 8,
                        position: "relative",
                      }}
                    >
                      <Video
                        source={{ uri: attachment.url }}
                        style={{
                          width: 64,
                          height: 64,
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                        resizeMode="cover"
                        paused={true}
                        poster={attachment.url}
                        posterResizeMode="cover"
                      />
                    </View>
                    <View
                      className="absolute inset-0 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                    >
                      <Ionicons name="play-circle" size={16} color="white" />
                    </View>
                    <View
                      className="absolute bottom-1 left-1 rounded px-1"
                      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
                    >
                      <Text className="text-white text-xs">
                        {formatDuration(attachment.duration)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }

              // File (generic)
              if (attachment.kind === "file") {
                return (
                  <TouchableOpacity
                    key={attachment.id || index}
                    className={`mb-2 p-3 rounded-lg border max-w-xs ${
                      isMe
                        ? "bg-white/20 border-white/30"
                        : "bg-gray-100 border-gray-300"
                    }`}
                    onPress={() => setShowModal(true)}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="document-outline"
                        size={24}
                        color={isMe ? "white" : "#374151"}
                      />
                      <View className="flex-1 ml-3">
                        <Text
                          className={`font-medium ${
                            isMe ? "text-white" : "text-gray-900"
                          }`}
                          numberOfLines={1}
                        >
                          {attachment.name || "Untitled File"}
                        </Text>
                        <Text
                          className={`text-xs ${
                            isMe ? "text-white/80" : "text-gray-600"
                          }`}
                        >
                          {formatFileSize(attachment.size)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }

              return null;
            })}

            {hasMore && (
              <TouchableOpacity
                className={`w-16 h-16 rounded-lg border-2 border-dashed justify-center items-center mb-2 ${
                  isMe ? "border-white/50" : "border-gray-400"
                }`}
                onPress={() => setShowModal(true)}
              >
                <Text className={`text-xs font-medium text-center }`}>
                  +{remainingCount}
                  {"\n"}khác
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Modal hiển thị toàn bộ attachments */}
        <AttachmentModal
          visible={showModal}
          attachments={attachments}
          onClose={() => setShowModal(false)}
          isMe={isMe}
        />
      </>
    );
  }
);

//test

const MessageRow = memo(
  ({
    roomId,
    item,
    meId,
    showTimestamp = true,
    showAvatar = true,
    isGroupChat = false,
    onLongPress,
  }: Props) => {
    const dispatch = useDispatch();
    const [isExpanded, setIsExpanded] = useState(false);
    const isMe = item?.sender?.id === meId;

    const avatarUri =
      item?.sender?.avatar && item.sender.avatar.startsWith("http")
        ? item.sender.avatar
        : AVATAR(item?.sender?.fullname || "U");

    // Check if message is long
    const isLongMessage = item?.content && item.content.length > 300;
    const shouldTruncate = isLongMessage && !isExpanded;

    // Get display content
    const displayContent = shouldTruncate
      ? item.content.substring(0, 300) + "..."
      : item.content;

    // Memoized callbacks
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

    // Format timestamp
    const formatTime = useCallback((dateString?: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        return date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        });
      }
    }, []);

    // Render message status icons
    const renderMessageStatus = useCallback(() => {
      if (!isMe) return null;

      // if (item.isSending) {
      //   return (
      //     <View className="flex-row items-center mt-1">
      //       <Ionicons name="time-outline" size={12} color="#9CA3AF" />
      //     </View>
      //   );
      // }

      // if (item.isDelivered && !item.isReadByMe) {
      //   return (
      //     <View className="flex-row items-center mt-1">
      //       <Ionicons name="checkmark-done" size={12} color="#9CA3AF" />
      //     </View>
      //   );
      // }
      if (item.readCount && item.readCount > 0) {
        return (
          <View className="flex-row items-center mt-1">
            <Ionicons name="checkmark-done" size={12} color="#3B82F6" />
          </View>
        );
      }

      return (
        <View className="flex-row items-center mt-1">
          <Ionicons name="checkmark" size={12} color="#c1cde6ff" />
        </View>
      );
    }, [isMe, item.readCount]);
    const renderIsReadme = useCallback(() => {
      if (!item.isReadByMe || isMe) return null;
      return (
        <View className="flex-row items-center mt-1">
          <Ionicons name="checkmark-done" size={12} color="#3B82F6" />
        </View>
      );
    }, [item.isReadByMe]);
    // Render reply preview
    const renderReplyPreview = useCallback(() => {
      if (!item.replyTo?.id) return null;
      const replyIsMe = item?.replyTo?.sender?.id == meId;
      return (
        <View>
          <Text className="text-xs text-blue-600 font-medium">
            {/* Bạn dã trả lời{" "}
            {replyIsMe ? " chính mình" : item.replyTo?.sender?.fullname || "Unknown"} */}
            {isMe ? "Bạn" : item.sender?.fullname || "Unknown"} đã trả lời
            {replyIsMe && isMe && <Text> chính mình</Text>}
            {replyIsMe && !isMe && <Text> Bạn</Text>}
            {!replyIsMe && isMe && (
              <Text> {item.replyTo?.sender?.fullname || "Unknown"}</Text>
            )}
          </Text>
          <View
            className={`bg-gray-200 rounded-2xl px-4 py-2 ${
              isMe
                ? "rounded-br-md  shadow-sm mr-1 ml-6"
                : "rounded-bl-md  shadow-sm ml-1 mr-6"
            }`}
          >
            <Text className="text-sm text-gray-600 text-end" numberOfLines={2}>
              {item.replyTo?.content}
            </Text>
          </View>
        </View>
      );
    }, [item.replyTo]);

    const [showModal, setShowModal] = useState(false);
    const handleLongPress = () => {
      setShowModal(true);
      console.log("mở modal");
    };

    const handleCloseModal = () => {
      setShowModal(false);
    };

    const handleEmojiPress = (emoji: string) => {
      console.log("Emoji pressed:", emoji);
      // Handle emoji reaction here
      Alert.alert("Emoji Reaction", `You reacted with ${emoji}`);
    };

    const handleReply = () => {
      console.log("Reply to message:", item.id);
      dispatch(msgActions.replyToMsg({ roomId: roomId ?? "", message: item }));
    };

    const handleForward = () => {
      console.log("Forward message:", item.id);
      Alert.alert("Forward", "Forward action triggered");
    };

    const handleCopy = async () => {
      try {
        Clipboard.setString(item.content);
        console.log("Đã copy!");
      } catch (err) {
        console.error("Copy failed", err);
      }
    };

    const handleDelete = () => {
      if (!roomId || !item?.id) return; // tránh dispatch rỗng

      const actionArr: Array<{
        text: string;
        style: "cancel" | "destructive";
        onPress?: () => void;
      }> = [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá ở phía bạn",
          style: "destructive",
          onPress: () => {
            setShowModal(false);
            dispatch(
              msgActions.delOnly({ roomId: roomId ?? "", msgId: item.id })
            );
          },
        },
      ];
      const deleteForEveryone = {
        text: "Xoá với mọi người",
        style: "destructive" as const,
        onPress: () => {
          setShowModal(false);
          dispatch(
            msgActions.delEveryone({ roomId: roomId ?? "", msgId: item.id })
          );
        },
      };
      if (
        isMe &&
        item?.createdAt &&
        (new Date().getTime() - new Date(item.createdAt).getTime()) /
          1000 /
          60 <
          5
      ) {
        actionArr.push(deleteForEveryone);
      }
      Alert.alert(
        "Xoá tin nhắn",
        "Bạn có chắc chắn muốn xoá tin nhắn này không?",
        actionArr
      );
    };

    const handlePin = () => {
      console.log("Pin message:", item.id);
      Alert.alert("Pin", "Message pinned");
    };

    const handleSetReminder = () => {
      console.log("Set reminder for message:", item.id);
      Alert.alert("Reminder", "Reminder set for this message");
    };

    const handleSelectMultiple = () => {
      console.log("Select multiple messages");
      Alert.alert("Select Multiple", "Multiple selection mode enabled");
    };

    const handleCreateQuickMessage = () => {
      console.log("Create quick message from:", item.content);
      Alert.alert("Quick Message", "Quick message template created");
    };

    const handleTranslate = () => {
      console.log("Translate message:", item.content);
      Alert.alert("Translate", "Message translation feature");
    };

    const handleReadAloud = () => {
      console.log("Read aloud message:", item.content);
      Alert.alert("Read Aloud", "Text-to-speech started");
    };

    const handleDetails = () => {
      console.log("Show details for message:", item.id);
      Alert.alert("Details", "Message details and info");
    };

    const handleSaveToCloud = () => {
      console.log("Save to cloud:", item.id);
      Alert.alert("Save to Cloud", "Message saved to cloud storage");
    };

    return (
      <View
        className={`relative my-1 flex-row items-end ${
          isMe ? "justify-end" : "justify-start"
        }`}
      >
        {/* Avatar for non-me messages */}
        {!item.isDeletedForMe && !isMe && showAvatar && (
          <View className="mr-5">
            <AvatarMini uri={avatarUri} side="left" />
          </View>
        )}
        {/* Message container */}

        {item.isDeletedForMe && (
          <View
            className={`flex-1 relative ${isMe ? "items-end" : "items-start"}`}
          >
            <View
              className={`rounded-2xl px-4 py-2 bg-white border border-gray-200 ${
                isMe
                  ? "rounded-br-md  shadow-sm mr-1 ml-6"
                  : "rounded-bl-md  shadow-sm ml-1 mr-6"
              }`}
            >
              {item.del_only && <Text>Tin nhắn đã được bạn xoá</Text>}
              {item.del_all && (
                <Text>
                  Tin nhắn đã được {isMe ? "xoá với mọi người" : "thu hồi"}
                </Text>
              )}
            </View>
          </View>
        )}

        {!item.isDeletedForMe && (
          <View
            className={`flex-1 relative ${isMe ? "items-end" : "items-start"}`}
          >
            {/* Sender name for group chats */}
            {!isMe && isGroupChat && (
              <Text className="text-xs text-gray-600 ml-3 mb-1">
                {item.sender?.fullname || "Unknown"}
              </Text>
            )}
            {renderReplyPreview()}
            <AttachmentRenderer
              attachments={item.attachments || []}
              isMe={isMe}
            />
            {/* Main message bubble */}
            <TouchableOpacity
              onLongPress={handleLongPress}
              delayLongPress={500}
              activeOpacity={0.8}
              className={`rounded-2xl px-4 py-2 ${
                isMe
                  ? "rounded-br-md bg-blue-400 shadow-sm mr-1 ml-6"
                  : "rounded-bl-md bg-white border border-gray-200 shadow-sm ml-1 mr-6"
              }`}
            >
              {/* Message content */}
              {displayContent && (
                <Text
                  selectable={false}
                  className={`text-base leading-5 ${
                    isMe ? "text-white" : "text-gray-900"
                  }`}
                >
                  {displayContent}
                </Text>
              )}

              {/* Attachments */}

              {/* Show more/less button for long messages */}
              {isLongMessage && (
                <TouchableOpacity
                  onPress={toggleExpanded}
                  className="mt-2 self-start"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <View
                    className={`flex-row items-center px-2 py-1 rounded-full ${
                      isMe ? "bg-blue-400" : "bg-gray-100"
                    }`}
                  >
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
              <View
                className={`flex-row items-center justify-between ${
                  isLongMessage ? "mt-2" : "mt-1"
                } ${isMe ? "justify-end" : "justify-start"}`}
              >
                {showTimestamp && (
                  <Text
                    className={`text-xs ${
                      isMe ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                )}
                {renderMessageStatus()}
                {renderIsReadme()}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Avatar for me messages */}
        {!item.isDeletedForMe && isMe && showAvatar && (
          <View className="ml-5">
            <AvatarMini uri={avatarUri} side="right" />
          </View>
        )}

        <MsgMdEvent
          isShow={showModal}
          item={item}
          onClose={handleCloseModal}
          onEmojiPress={handleEmojiPress}
          onReply={handleReply}
          onForward={handleForward}
          onSaveToCloud={handleSaveToCloud}
          onCopy={handleCopy}
          onPin={handlePin}
          onSetReminder={handleSetReminder}
          onSelectMultiple={handleSelectMultiple}
          onCreateQuickMessage={handleCreateQuickMessage}
          onTranslate={handleTranslate}
          onReadAloud={handleReadAloud}
          onDetails={handleDetails}
          onDelete={handleDelete}
        />
      </View>
    );
  }
);

MessageRow.displayName = "MessageRow";

export default MessageRow;
