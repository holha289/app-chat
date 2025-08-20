import { Text } from "react-native";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const InfoCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View className="bg-white rounded-2xl p-5 shadow-sm shadow-slate-200">
    <Text className="text-lg font-semibold text-gray-800 mb-4">{title}</Text>
    <View className="space-y-3">{children}</View>
  </View>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View className="flex-row items-center justify-between py-2">
    <View className="flex-row items-center">
      <Ionicons name={icon as any} size={22} color="#4b5563" className="w-7" />
      <Text className="text-gray-600 text-base ml-3">{label}</Text>
    </View>
    <Text
      className="text-gray-900 text-base font-medium text-right flex-1"
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

export { InfoCard, InfoRow };