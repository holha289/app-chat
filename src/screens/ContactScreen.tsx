import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { classBtn, colors } from "@app/styles/main.style";
import { useNavigation,useRoute } from "@react-navigation/native";
import { ContactClassStyle } from "@app/styles/contact.style";
import clsx from "clsx";
import CreateGroupModal from "@app/components/Modals/CreatGroupModal";
import { useDispatch } from "react-redux";
import ContactActions from "@app/features/contact/contact.action";
import { useSelector } from "react-redux";
import { selectContactLoading, selectListFriends, selectListGroups, selectListPending } from "@app/features/contact/contact.selectors";
import { InputGroup, LoadingOverlay } from "@app/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UserActions from "@app/features/user/user.action";
import SendFriendRequestModal from "@app/components/Modals/SendFriendRequestModal";
import IncomingCallModal from "@app/components/Modals/IncomingCallModel";

const tabs = [
  { id: "friends", name: "Bạn bè" },
  { id: "groups", name: "Nhóm" },
  { id: "requests", name: "Yêu cầu kết bạn" }
];

const ContactScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("friends");
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const dispatch = useDispatch();
  const isLoading = useSelector(selectContactLoading);
  const listFriends = useSelector(selectListFriends);
  const listGroups = useSelector(selectListGroups);
  const listPending = useSelector(selectListPending);
   const insets = useSafeAreaInsets();

   // mounted
  useEffect(() => {
     dispatch(ContactActions.getListFriendsRequest());
  }, []);


  const handleNavigateByTab = (tab: string, item: any) => {
    navigation.navigate("InfoScreen", {
      user: item,
      friendshipStatus: tab === "friends" ? "friends" : tab === "groups" ? "groups" : "pending"
    });
  };

  const handleTabPress = (tab: string) => {
    if (tab === "friends") {
      dispatch(ContactActions.getListFriendsRequest());
    } else if (tab === "groups") {
      dispatch(ContactActions.getListGroupsRequest());
    } else if (tab === "requests") {
      dispatch(ContactActions.getListPendingRequest());
    }
    setActiveTab(tab);
  };

  const handleAcceptFriendRequest = (userId: number) => {
    dispatch(UserActions.acceptFriendRequest({ userId, callback: (error) => {
      if (error) {
         Alert.alert("Có lỗi xảy ra", error);
      } else {
        Alert.alert("Thành công", "Đã chấp nhận lời mời kết bạn");
      }
    }}));
  };

  const handleRejectFriendRequest = (userId: number) => {
    dispatch(UserActions.rejectFriendRequest({ userId, callback: (error) => {
      if (error) {
        Alert.alert("Có lỗi xảy ra", error);
      } else {
        Alert.alert("Thành công", "Đã từ chối lời mời kết bạn");
      }
    }}));
  };

  const renderItem = (item: any, tab: string) => {
    return (
      <TouchableOpacity className={ContactClassStyle.renderItem} onPress={() => handleNavigateByTab(tab, item)}>
        <Image
          source={{ uri: Array.isArray(item.avatar) ? item.avatar[0] : item.avatar }}
          className="w-12 h-12 rounded-full mr-4"
        />
        <View className="flex-1">
          <Text className="text-lg font-semibold">{item.fullname}</Text>
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
            <TouchableOpacity className="p-2" onPress={() => handleRejectFriendRequest(item.id)}>
                <Ionicons name="close" size={25} color="red"  />
              </TouchableOpacity>
              <TouchableOpacity className="p-2" onPress={() => handleAcceptFriendRequest(item.id)}>
                <Ionicons name="checkmark" size={25} color="green"  />
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className={ContactClassStyle.container}  style={{ paddingTop: insets.top }}>
      {isLoading && <LoadingOverlay visible={isLoading} />}
      {/* Search Input and Add Button */}
      <View className={ContactClassStyle.searchInput}>
        <TouchableOpacity className="flex-1 mr-3">
          <View className="flex-row items-center py-2">
            <InputGroup
              iconLeft={<Ionicons name="search" size={20} color="gray" />}
              placeholder={activeTab === "friends" ? "Tìm kiếm bạn bè" : 
              activeTab === "groups" ? "Tìm kiếm nhóm" : "Tìm kiếm yêu cầu"}
              rounded={20}
              height={40}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="h-10 w-10 flex items-center justify-center bg-white rounded-full shadow"  onPress={() => navigation.navigate("Search")}>
          <Ionicons name="person-add" size={20} color={colors.color1}  />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-white rounded-xl mb-4 p-1 shadow">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`flex-1 py-3 rounded-lg bg-[${tab.id === activeTab ? colors.color2 : 'white'}]`}
            onPress={() => handleTabPress(tab.id)}
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
            <TouchableOpacity className={clsx(classBtn.outline, "mb-4 flex-row gap-2")} onPress={() => setIsCreateGroupModalOpen(true)}>
                <FontAwesome name="group" size={20} color={colors.color1} />
                <Text className="font-semibold">Tạo nhóm mới</Text>
            </TouchableOpacity>
         </>
      )

      }

      {/* Content based on active tab */}
      <FlatList
        data={activeTab === "friends" ? listFriends : activeTab === "groups" ? listGroups : listPending}
        renderItem={({ item }: { item: any }) => renderItem(item, activeTab)}
        keyExtractor={(item: any, index: number) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
      {/* <IncomingCallModal
        visible={true}
        onAccept={() => {}}
        onDecline={() => {}}
        caller={{ id: '1', fullname: 'John Doe', avatar: 'https://via.placeholder.com/150' }}
        isVideoCall={true}
      /> */}
    </View>
  );
};

export default ContactScreen;
