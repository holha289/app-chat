import React from "react";
import { View, Text, TouchableOpacity, Modal, Dimensions } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';


import AvatarMini from "./AvatarMini";
import { MessageItem } from "@app/features/types/msg.type";

const { width: screenWidth } = Dimensions.get("window");

type Props = {
  isShow: boolean;
  item: MessageItem;
  onClose: () => void;
  onEmojiPress?: (emoji: string) => void;
  onReply?: () => void;
  onForward?: () => void;
  onSaveToCloud?: () => void;
  onCopy?: () => void;
  onPin?: () => void;
  onSetReminder?: () => void;
  onSelectMultiple?: () => void;
  onCreateQuickMessage?: () => void;
  onTranslate?: () => void;
  onReadAloud?: () => void;
  onDetails?: () => void;
  onDelete?: () => void;
};

export const MsgMdEvent = ({
  isShow,

  onClose,
  onEmojiPress,
  onReply,
  onForward,
  onSaveToCloud,
  onCopy,
  onPin,
  onSetReminder,
  onSelectMultiple,
  onCreateQuickMessage,
  onTranslate,
  onReadAloud,
  onDetails,
  onDelete,
}: Props) => {  // Popular emoji reactions

  // Action items configuration
  const actionItems = [
    {
      icon: "arrow-undo",
      label: "Trả lời",
      onPress: onReply,
      color: "#3B82F6",
    },
    // {
    //   icon: "arrow-redo",
    //   label: "Chuyển tiếp",
    //   onPress: onForward,
    //   color: "#3B82F6",
    // },
    // {
    //   icon: "cloud-upload",
    //   label: "Lưu Cloud",
    //   onPress: onSaveToCloud,
    //   color: "#3B82F6",
    // },
    {
      icon: "copy",
      label: "Sao chép",
      onPress: onCopy,
      color: "#3B82F6",
    },

    // {
    //   icon: "attach",
    //   label: "Ghim",
    //   onPress: onPin,
    //   color: "#F59E0B",
    // },
    // {
    //   icon: "time",
    //   label: "Nhắc hẹn",
    //   onPress: onSetReminder,
    //   color: "#EF4444",
    // },
    // {
    //   icon: "checkmark-circle",
    //   label: "Chọn nhiều",
    //   onPress: onSelectMultiple,
    //   color: "#3B82F6",
    // },
    // {
    //   icon: "flash",
    //   label: "Tạo tin nhắn nhanh",
    //   onPress: onCreateQuickMessage,
    //   color: "#3B82F6",
    // },
    // {
    //   icon: "language",
    //   label: "Dịch",
    //   onPress: onTranslate,
    //   color: "#10B981",
    //   badge: "MỚI",
    // },
    // {
    //   icon: "volume-high",
    //   label: "Đọc văn bản",
    //   onPress: onReadAloud,
    //   color: "#8B5CF6",
    //   badge: "MỚI",
    // },
    // {
    //   icon: "information-circle",
    //   label: "Chi tiết",
    //   onPress: onDetails,
    //   color: "#6B7280",
    // },
    {
      icon: "trash",
      label: "Xóa",
      onPress: onDelete,
      color: "#EF4444",
    },
    // {
    //   icon: "menu",
    //   label: "Xem thêm",
    //   onPress: () => {},
    //   color: "#3B82F6",
    // },
    //    {
    //   icon: "reorder-four",
    //   label: "Thu hồi",
    //   onPress: () => {},
    //   color: "#3B82F6",
    // },
  ];

  const handleEmojiPress = (emoji: string) => {
    onEmojiPress?.(emoji);
    onClose();
  };

  const handleActionPress = (action?: () => void) => {
    if (action) {
      action();
      onClose();
    }
  };

  return (
    <Modal
      visible={isShow}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop: nhấn để đóng */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 justify-end items-center"
      >
        {/* Wrapper nội dung ở cuối (không đóng khi chạm) */}
        <View className="">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            className="w-full  overflow-hidden"
          >
            {/* Action Items */}
            <View className="bg-white  w-full">
              <View className="flex-row w-full flex-wrap justify-between">
                {actionItems.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleActionPress(action.onPress)}
                    className="w-[23%] mb-4 items-center"
                    activeOpacity={0.7}
                  >
                    <View className="relative">
                      <View className="w-12 h-12  items-center justify-center mb-2">
                        <Ionicons
                          name={action.icon as any}
                          size={20}
                          color={action.color}
                        />
                      </View>
                    </View>

                    <Text
                      className="text-xs text-center text-gray-700 leading-3"
                      numberOfLines={2}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
