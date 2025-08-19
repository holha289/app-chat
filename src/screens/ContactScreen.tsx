import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { classBtn, colors } from "@app/styles/main.style";
import { useNavigation,useRoute } from "@react-navigation/native";
import { ContactClassStyle } from "@app/styles/contact.style";
import clsx from "clsx";

const { width } = Dimensions.get("window");

const contacts = [
  { id: "1", name: "Phạm Ánh Sao", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: "2", name: "Lê Thiên Trí", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: "3", name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: "4", name: "Trần B", avatar: "https://i.pravatar.cc/150?img=4" },
];

const groups = [
  { id: "1", name: "Nhóm Lập Trình", avatar: "https://i.pravatar.cc/150?img=5", members: 8 },
  { id: "2", name: "Nhóm Học Tập", avatar: "https://i.pravatar.cc/150?img=6", members: 12 },
  { id: "3", name: "Nhóm Dự Án", avatar: "https://i.pravatar.cc/150?img=7", members: 5 },
];

const friendRequests = [
  { id: "1", name: "Nguyễn Minh Tú", avatar: "https://i.pravatar.cc/150?img=8" },
  { id: "2", name: "Trần Thị Lan", avatar: "https://i.pravatar.cc/150?img=9" },
  { id: "3", name: "Lê Hoàng Nam", avatar: "https://i.pravatar.cc/150?img=10" },
];

const tabs = [
  { id: "friends", name: "Bạn bè" },
  { id: "groups", name: "Nhóm" },
  { id: "requests", name: "Yêu cầu kết bạn" }
]

const ContactScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("friends");

  const handleNavigateByTab = (tab: string, item: any) => {
    navigation.navigate("InfoScreen", {
      user: item,
      friendshipStatus: tab === "friends" ? "friends" : tab === "groups" ? "groups" : "pending"
    });
  };

  const renderItem = (item: any, tab: string) => {
    return (
      <TouchableOpacity className={ContactClassStyle.renderItem} onPress={() => handleNavigateByTab(tab, item)}>
        <Image
          source={{ uri: item.avatar }}
          className="w-12 h-12 rounded-full mr-4"
        />
        <View className="flex-1">
          <Text className="text-lg font-semibold">{item.name}</Text>
          <Text className="text-sm text-gray-500">
            {tab === "friends" ? "Bạn bè" : tab === "groups" ? `${item.members} thành viên` : "Yêu cầu kết bạn"}
          </Text>
        </View>
        <View className="flex-row items-center space-x-4">
          { tab === "friends" || tab === "groups" ? (
             <>
               <TouchableOpacity className="p-2">
                  <Ionicons name="call" size={20} color={colors.color1} />
                </TouchableOpacity>
                <TouchableOpacity className="p-2">
                  <Ionicons name="videocam" size={20} color={colors.color1} />
                </TouchableOpacity>
             </>
          ) : (
            <>
            <TouchableOpacity className="p-2">
                <Ionicons name="close" size={20} color="red" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2">
                <Ionicons name="checkmark" size={20} color="green" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className={ContactClassStyle.container}>
      {/* Search Input and Add Button */}
      <View className={ContactClassStyle.searchInput}>
        <TouchableOpacity onPress={() => navigation.navigate("Search")} className="flex-1 mr-3">
          <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow">
            <Ionicons name="search" size={20} color="gray" />
            <Text className="flex-1 ml-2 text-base">
              {activeTab === "friends" ? "Tìm kiếm bạn bè" : 
               activeTab === "groups" ? "Tìm kiếm nhóm" : "Tìm kiếm yêu cầu"}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="h-10 w-10 flex items-center justify-center bg-white rounded-full shadow">
          <Ionicons name="person-add" size={20} color={colors.color1} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-white rounded-xl mb-4 p-1 shadow">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`flex-1 py-3 rounded-lg bg-[${tab.id === activeTab ? colors.color2 : 'white'}]`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              className={`text-center font-semibold text-${tab.id === activeTab ? "white" : "gray-600"}`}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      { activeTab === "groups" && (
         <>
            <TouchableOpacity className={clsx(classBtn.outline, "mb-4 flex-row gap-2")}>
                <FontAwesome name="group" size={20} color={colors.color1} />
                <Text className="font-semibold">Tạo nhóm mới</Text>
            </TouchableOpacity>
         </>
      )

      }

      {/* Content based on active tab */}
      <FlatList
        data={activeTab === "friends" ? contacts : activeTab === "groups" ? groups : friendRequests}
        renderItem={({ item }) => renderItem(item, activeTab)}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
};

export default ContactScreen;
