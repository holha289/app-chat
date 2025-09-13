import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

import useMedia from "@app/utils/useMeida";
import { FlatList } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";
import msgActions from "@app/features/message/msg.action";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
type Props = {
  isShow: boolean;
  onClose: () => void;
  roomId: string;
};

export const MediaSelect = ({ isShow, onClose, roomId }: Props) => {
  const dispatch = useDispatch();
  const rawMedia = useMedia();
  const [selectedUris, setSelectedUris] = useState<Set<string>>(new Set());

  // Kiểm tra có ảnh nào được chọn không
  const hasSelected = selectedUris.size > 0;
  const selectedCount = selectedUris.size;

  const media = rawMedia.map((m) => {
    const uri = m.node.image.uri;
    return {
      uri,
      kind: m.node.type.startsWith("video") ? "video" : "image",

      isSelected: selectedUris.has(uri),
    };
  });

  const handleClose = () => {
    // Reset selected data khi đóng modal
    setSelectedUris(new Set());
    onClose();
  };

  const toggleSelect = (uri: string) => {
    setSelectedUris((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(uri)) {
        newSet.delete(uri);
      } else {
        newSet.add(uri);
      }
      return newSet;
    });
  };

  return (
    <Modal
      visible={isShow}
      animationType="slide"
      onRequestClose={handleClose}
      transparent
    >
      <View className="flex-1">
        {/* Overlay để đóng modal khi tap ngoài */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          style={{ height: screenHeight * 0.5 }}
          className="flex-1 bg-black/50"
        />

        {/* Modal content - 50% màn hình */}
        <View
          style={{ height: screenHeight * 0.5 }}
          className="bg-white rounded-t-3xl"
        >
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <View>
              <Text className="text-lg font-semibold">Chọn ảnh/video</Text>
              {hasSelected && (
                <Text className="text-sm text-gray-500 mt-1">
                  Đã chọn {selectedCount} mục
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Text className="text-blue-500 text-base">Đóng</Text>
            </TouchableOpacity>
          </View>

          {/* Media list */}
          <View className="flex-1 px-2">
            <FlatList
              data={media}
              numColumns={3}
              keyExtractor={(item) => item.uri}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
              renderItem={({ item, index }) => {
                const itemWidth = screenWidth / 3 - 8; // Responsive width

                return (
                  <TouchableOpacity
                    style={{
                      width: itemWidth,
                      height: itemWidth,
                      margin: 2,
                      borderRadius: 8,
                      borderWidth: item.isSelected ? 4 : 0,
                      borderColor: item.isSelected ? "red" : "transparent",
                    }}
                    onPress={() => {
                      toggleSelect(item.uri);
                      console.log("Selected:", item.uri, !item.isSelected);
                    }}
                  >
                    <View className="relative">
                      <Image
                        source={{ uri: item.uri }}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 8,
                          opacity: item.isSelected ? 0.7 : 1,
                        }}
                        resizeMode="cover"
                      />
                      {/* Selected overlay */}
                      {item.isSelected && (
                        <View
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: "#3B82F6",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontSize: 14,
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </Text>
                        </View>
                      )}
                      {item.kind === "video" && (
                        <View
                          style={{
                            position: "absolute",
                            bottom: 4,
                            left: 4,
                            backgroundColor: "rgba(0,0,0,0.7)",
                            borderRadius: 12,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                          }}
                        >
                          <Text style={{ color: "white", fontSize: 12 }}>
                            🎥
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Footer - hiển thị khi có items được chọn */}
          {hasSelected && (
            <View className="p-4 border-t border-gray-200">
              <TouchableOpacity
                className="bg-blue-500 rounded-lg py-3 px-4"
                onPress={() => {
                  console.log("Confirmed selection:", Array.from(selectedUris));

                  // Chuyển URIs thành Attachment objects với đầy đủ metadata
                  Array.from(selectedUris).forEach((uri) => {
                    const mediaItem = rawMedia.find(
                      (m) => m.node.image.uri === uri
                    );
                    const isVideo =
                      mediaItem?.node.type.startsWith("video") ?? false;

                    dispatch(
                      msgActions.addAttachmentToMsg({
                        roomId,
                        attachment: {
                          url: uri,
                          kind: isVideo ? "video" : "image",
                          name:
                            mediaItem?.node.image.filename ||
                            `media_${Date.now()}`,
                          size: mediaItem?.node.image.fileSize ?? undefined,
                          width: mediaItem?.node.image.width ?? undefined,
                          height: mediaItem?.node.image.height ?? undefined,
                          duration: isVideo
                            ? mediaItem?.node.image.playableDuration
                            : undefined,
                          status: "uploaded" as const,
                          mimetype:
                            mediaItem?.node.type ||
                            (isVideo ? "video/mp4" : "image/jpeg"),
                        },
                      })
                    );
                  });

                  handleClose();
                }}
              >
                <Text className="text-white text-center font-semibold">
                  Xác nhận ({selectedCount} mục)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
