import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  RefreshControl,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { classBtn, colors } from "@app/styles/main.style";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ContactClassStyle } from "@app/styles/contact.style";
import clsx from "clsx";
import CreateGroupModal from "@app/components/Modals/CreatGroupModal";
import { useDispatch } from "react-redux";
import ContactActions from "@app/features/contact/contact.action";
import { useSelector } from "react-redux";
import { selectContactLoading, selectListFriends, selectListGroups, selectListPending } from "@app/features/contact/contact.selectors";
import { Input, InputGroup, InputOtp, LoadingOverlay } from "@app/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UserActions from "@app/features/user/user.action";
import { selectUser } from "@app/features";
import { Friends } from "@app/features/types/contact.type";
import { API_URL } from "@app/config";

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
  const listFriends = useSelector(selectListFriends);
  const listGroups = useSelector(selectListGroups);
  const listPending = useSelector(selectListPending);
  const insets = useSafeAreaInsets();
  const user = useSelector(selectUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // mounted
  useEffect(() => {
    setIsLoading(true);
    const wait = async () => {
      await Promise.all([
        dispatch(ContactActions.getListFriendsRequest({ offset: 0, limit: 20 })),
        dispatch(ContactActions.getListGroupsRequest({ offset: 0, limit: 20 })),
        dispatch(ContactActions.getListPendingRequest({ offset: 0, limit: 20 }))
      ]);
      setIsLoading(false);
    };
    wait();
  }, []);


  const handleNavigateByTab = (tab: string, item: any) => {
    if (tab === "friends" || tab === "groups") {
      navigation.navigate("ChatRoom", {
        id: item.room_id || item.id,
        name: item.fullname || item.name,
        avatar: item.room_avatar || (Array.isArray(item.avatar) ? item.avatar[0] : item.avatar),
        type: tab === "friends" ? "private" : "group",
      });
    } else {
      navigation.navigate("InfoScreen", {
        user: item,
        friendshipStatus: tab === "friends" ? "friends" : tab === "groups" ? "groups" : "pending"
      });
    }
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  const handleAcceptFriendRequest = (userId: string) => {
    setIsLoading(true);
    dispatch(UserActions.acceptFriendRequest({
      userId, callback: (error) => {
        setIsLoading(false);
        if (error) {
          Alert.alert("Có lỗi xảy ra", error);
        } else {
          Alert.alert("Thành công", "Đã chấp nhận lời mời kết bạn");
        }
      }
    }));
  };

  const handleRejectFriendRequest = (userId: string) => {
    setIsLoading(true);
    dispatch(UserActions.rejectFriendRequest({
      userId, callback: (error) => {
        setIsLoading(false);
        if (error) {
          Alert.alert("Có lỗi xảy ra", error);
        } else {
          Alert.alert("Thành công", "Đã từ chối lời mời kết bạn");
        }
      }
    }));
  };

  const onRefresh = () => {
    if (tabs.length === 0) return;
    setIsRefreshing(true);
    if (activeTab === "friends") {
      dispatch(ContactActions.getListFriendsRequest({ offset: 0, limit: 20 }));
    } else if (activeTab === "groups") {
      dispatch(ContactActions.getListGroupsRequest({ offset: 0, limit: 20 }));
    } else if (activeTab === "requests") {
      dispatch(ContactActions.getListPendingRequest({ offset: 0, limit: 20 }));
    }
    setIsRefreshing(false);
  };

  const handleCall = (userTo: Friends, isVideoCall: boolean = false) => {
    // Dispatch an action to initiate a call
    dispatch(UserActions.call({
      from: user as unknown as Friends,
      to: userTo,
      roomId: userTo.room.room_id,
      isVideoCall: isVideoCall,
      category: 'request'
    }));
  };

  // search
  const handleSearch = (val: string, tab: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      if (tab === "friends") {
        dispatch(ContactActions.getListFriendsRequest({ offset: 0, limit: 20, q: val }));
      } else if (tab === "groups") {
        dispatch(ContactActions.getListGroupsRequest({ offset: 0, limit: 20, q: val }));
      } else if (tab === "requests") {
        dispatch(ContactActions.getListPendingRequest({ offset: 0, limit: 20, q: val }));
      }
    }, 400); // 400ms debounce
  };

  const getAvatarUrl = (avatar: string) => {
    if (!avatar) return "";
    if (/^https?:\/\//.test(avatar)) {
      return avatar;
    }
    const normalizedAvatar = avatar.replace(/\\/g, "/");
    const url = `${API_URL}${normalizedAvatar.startsWith("/") ? "" : "/"}${normalizedAvatar}`;
    console.log('Avatar URL:', url);
    return url;
  };

  const renderItem = (item: any, tab: string) => {
    return (
      <TouchableOpacity className={ContactClassStyle.renderItem} onPress={() => handleNavigateByTab(tab, item)}>
        <Image
          source={{ uri: getAvatarUrl(item.room_avatar ? item.room_avatar : (Array.isArray(item.avatar) ? item.avatar[0] : item.avatar)) }}
          className="w-12 h-12 rounded-full mr-4"
        />
        <View className="flex-1">
          <Text className="text-lg font-semibold">{item.fullname || item.name}</Text>
          <Text className="text-sm text-gray-500">
            {tab === "friends" ? "Bạn bè" : tab === "groups" ? `${item.member_count} thành viên` : "Yêu cầu kết bạn"}
          </Text>
        </View>
        <View className="flex-row items-center space-x-4">
          {tab === "friends" ? (
            <>
              <TouchableOpacity className="p-2" onPress={() => handleCall(item)}>
                <Ionicons name="call" size={20} color={colors.color1} />
              </TouchableOpacity>
              <TouchableOpacity className="p-2" onPress={() => handleCall(item, true)}>
                <Ionicons name="videocam" size={20} color={colors.color1} />
              </TouchableOpacity>
            </>
          ) : tab === "groups" ? null : (
            <>
              <TouchableOpacity className="p-2" onPress={() => handleRejectFriendRequest(item.id)}>
                <Ionicons name="close" size={25} color="red" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2" onPress={() => handleAcceptFriendRequest(item.id)}>
                <Ionicons name="checkmark" size={25} color="green" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className={ContactClassStyle.container} style={{ paddingTop: insets.top }}>
      {isLoading && <LoadingOverlay visible={isLoading} />}
      {/* Search Input and Add Button */}
      <View className={ContactClassStyle.searchInput}>
        <TouchableOpacity className="flex-1 mr-3">
          <View className="flex-row items-center py-2 w-full">
            <InputGroup
              iconLeft={<Ionicons name="search" size={20} color="gray" />}
              placeholder={activeTab === "friends" ? "Tìm kiếm bạn bè" :
                activeTab === "groups" ? "Tìm kiếm nhóm" : "Tìm kiếm yêu cầu"}
              rounded={20}
              height={40}
              onChangeText={(val) => handleSearch(val, activeTab)}
            />

          </View>
        </TouchableOpacity>
        <TouchableOpacity className="h-10 w-10 flex items-center justify-center bg-white rounded-full shadow" onPress={() => navigation.navigate("Search")}>
          <Ionicons name="person-add" size={20} color={colors.color1} />
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

      {activeTab === "groups" && (
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
            colors={["#3b82f6"]}
          />
        }
      />
      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
    </View>
  );
};

export default ContactScreen;
