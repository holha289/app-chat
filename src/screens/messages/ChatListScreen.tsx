import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { Avatar, LoadingOverlay } from "@app/components";
import { selectUser } from "@app/features";
import { store } from "@app/store";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import msgActions from "@app/features/message/msg.action";
import {
  selectMsgStatus,
  selectRooms,
} from "@app/features/message/msg.selectors";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { TimeAgoVN } from "@app/components/TimeAgoVN";
import { useSockerIo } from "@app/hooks/use-socketio";

export default function ChatListScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);
 const { socket } = useSockerIo();
  const conversations = useSelector(selectRooms) ?? []; // 🔥 lấy trực tiếp từ store
  const status = useSelector(selectMsgStatus); // để biết đang loading

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      dispatch(msgActions.getRoom()); // thunk/saga sẽ cập nhật store
    } catch (error) {
      console.error("Lỗi khi làm mới dữ liệu:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch]);
//   const socketHandler= useCallback((payload:any)=>{
//     const m=payload?.metadata
//     const msg=m?.message
//     const roomId=m?.roomId
//     const message={
//       msg_id:msg?.id,
//       createdAt:msg?.createdAt,
//       msg_content:msg?.content,
//     }
//     dispatch(msgActions.updateLastMsg({roomId, message,is_read:false}))
//   },[dispatch])
// // useEffect listener for socket events
//   useEffect(() => {
//     if (!socket) return
//     if (socket) {
//       socket.on("room:message:received", socketHandler);
//     }
//     return () => {
//       if (socket) {
//         socket.off("room:message:received", socketHandler);
//       }
//     };
//   }, [socketHandler]);



  useEffect(() => {
    onRefresh(); // load lần đầu
  }, [onRefresh]);
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm"
      onPress={() => navigation.navigate("ChatRoom", item)}
    >
      <Image
        source={{ uri: item.avatar }}
        className="w-14 h-14 rounded-full mr-4"
      />
      <View className="flex-1">
        <View className="flex-row justify-between mb-1">
          <Text className="font-semibold text-base">{item.name}</Text>
          <Text className="text-xs text-gray-400">
            {/* {item.last_message.createdAt} */}
            <TimeAgoVN value={item.last_message.createdAt} />
          </Text>
        </View>
        <Text
          numberOfLines={1}
          className={`text-sm ${
            !item.is_read ? "font-bold text-black" : "text-gray-500"
          }`}
        >
          {item.last_message.msg_content}
        </Text>
      </View>
      {!item.is_read && (
        <View className="w-2 h-2 bg-red-500 rounded-full ml-2" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      {/* <MyComponent /> */}
      <View className="flex-1 bg-gray-50 px-4">
        <View className="flex-row justify-between items-center  mb-4">
          <Text className="text-3xl font-extrabold text-blue-600">WChat</Text>
          <View className="flex-row items-center space-x-2">
            <Ionicons name="create-outline" size={24} color="#3b82f6" />
            {/* <Avatar
            uri={user?.avatar}
            name={user?.fullname}
            size="small"
          /> */}
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
          <View className="mb-4 flex-row items-center bg-white rounded-full px-4 py-2 shadow">
            <Ionicons name="search" size={20} color="gray" />
            <Text className="flex-1 ml-2 text-base py-2">Tìm kiếm</Text>
          </View>
        </TouchableOpacity>

        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
              colors={["#3b82f6"]}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}
