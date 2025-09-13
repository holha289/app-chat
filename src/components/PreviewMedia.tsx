import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Modal } from "react-native-paper";
import Video from "react-native-video";
type Props = {
  uri: string;
  kind?: string;
  classButton?: string;
  isRemove?: boolean;
  onRemove?: () => void;
};

export const PreviewMedia = ({
  uri,
  kind,
  classButton,
  isRemove,
  onRemove,
}: Props) => {
  const [openMode, setOpenMode] = useState<boolean>(false);
  const openMedia = () => {
    setOpenMode(true);
  };
  const onClose = () => {
    setOpenMode(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={openMedia} className="relative">
        {/* <View>
          <Ionicons
            name="close-circle"
            size={24}
            color="white"
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              zIndex: 10,
            }}
          />
        </View> */}
        {isRemove === true && (
          <TouchableOpacity
            onPress={onRemove}
            className="absolute top-0 left-0 z-10"
          >
            <Ionicons name="close-circle" size={24} color="gray" />
          </TouchableOpacity>
        )}
        <Image
          source={{
            uri: uri,
          }}
          className={classButton}
        />
      </TouchableOpacity>
    </View>
  );
};
