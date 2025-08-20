
import { Alert, Text, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ActionButtonProps {
  icon: string;
  label: string;
  color: string;
  textColor?: string;
  flex?: number;
  onPress?: () => void;
}

const ActionButton = ({
  icon,
  label,
  color,
  textColor = "text-white",
  flex,
  onPress,
}: ActionButtonProps) => (
  <TouchableOpacity
    onPress={
      onPress || (() => Alert.alert("Thông báo", `${label} sẽ được cập nhật`))
    }
    className={`py-3.5 rounded-xl flex-row items-center justify-center shadow-md ${color}`}
    style={{ flex: flex }}
  >
    <Ionicons
      name={icon as any}
      size={20}
      color={textColor === "text-white" ? "white" : "#374151"}
    />
    <Text className={`${textColor} text-center font-semibold ml-2 text-base`}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default ActionButton;