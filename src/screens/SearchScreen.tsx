import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { colors } from "@app/styles/main.style";
import HeaderSearch from "@app/components/headers/HeaderSearch";
import { useDebounce } from "@app/hooks/use-debounce";
import { useSelector } from "react-redux";
import { selectListSearchResults } from "@app/features/contact/contact.selectors";
import { useDispatch } from "react-redux";
import ContactActions from "@app/features/contact/contact.action";
import UserActions from "@app/features/user/user.action";
import SendFriendRequestModal from "@app/components/Modals/SendFriendRequestModal";

const SearchScreen = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const debouncedText = useDebounce(query, 500);
  const dispatch = useDispatch();
  const listUsers = useSelector(selectListSearchResults);
  const [isSendFriendRequestModalOpen, setIsSendFriendRequestModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(()=>{
    dispatch(ContactActions.searchContact({ phone: debouncedText }));
    navigation.setOptions({
        header: () => <HeaderSearch navigation={navigation} onchange={handleSearchChange} />
    });
  }, [navigation, debouncedText]);

  const handleSearchChange = (text: string) => {
    setQuery(text);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity onPress={() => {
      setSelectedUser(item);
      setIsSendFriendRequestModalOpen(true);
    }}  className="flex-row items-center px-4 py-3 bg-white mb-3 rounded-[12px] shadow border border-gray-200" >
      <Image
        source={{ uri: item.avatar }}
        className="w-12 h-12 rounded-full mr-4"
      />
      <View className="flex-1">
        <Text className="text-lg font-semibold">{item.fullname}</Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="person-add" size={24} color={colors.color1} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100 pt-2 px-4">
      {/* Kết quả */}
      <FlatList
        data={listUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
      <SendFriendRequestModal
        visible={isSendFriendRequestModalOpen}
        onClose={() => setIsSendFriendRequestModalOpen(false)}
        user={selectedUser}
      />
    </View>
  );
};

export default SearchScreen;
