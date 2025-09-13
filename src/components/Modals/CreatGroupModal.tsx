import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    Image,
    FlatList,
    SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@app/styles/main.style';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';
import Input from '../Input';
import { useDispatch, useSelector } from 'react-redux';
import { selectListFriends } from '@app/features/contact/contact.selectors';
import ContactActions from '@app/features/contact/contact.action';
import { Friends } from '@app/features/types/contact.type';
import LoadingOverlay from '../LoadingOverlay';
import UploadService from '@app/services/upload.service';
import { requestCameraPermissions, requestFilePermissions } from '@app/core/permissions';

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
    isOpen,
    onClose
}) => {
    const [form, setForm] = useState({ name: '', avatar: '', friends: [] as number[] });
    const [searchFriend, setSearchFriend] = useState('');
    const listFriends = useSelector(selectListFriends);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        // Reset search when the modal opens
        if (isOpen) {
            setSearchFriend('');
            setForm({ name: '', avatar: '', friends: [] as number[] });
            if (listFriends.length === 0) {
                dispatch(ContactActions.getListFriendsRequest({
                    offset: 0,
                    limit: 20
                }));
            }
        }
    }, [isOpen]);
    // Filter friends based on search
    const filteredFriends = listFriends.filter(friend =>
        friend.fullname.toLowerCase().includes(searchFriend.toLowerCase())
    );

    const toggleFriendSelection = (friendId: number) => {
        setForm(prev => {
            const friends = prev.friends.includes(friendId)
                ? prev.friends.filter(id => id !== friendId)
                : [...prev.friends, friendId];
            return { ...prev, friends };
        });
    };

    const handleImagePicker = () => {
        Alert.alert(
            'Chọn ảnh',
            'Chọn nguồn ảnh',
            [
                {
                    text: 'Camera',
                    onPress: () => openCamera(),
                },
                {
                    text: 'Thư viện',
                    onPress: () => openGallery(),
                },
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    const openCamera = async () => {
        const permission = await requestCameraPermissions();
        if (!permission) {
            Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập camera để chụp ảnh.');
            return;
        }
        const options: CameraOptions = {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 800,
            maxHeight: 800,
            includeBase64: false,
        };

        launchCamera(options, async (response: ImagePickerResponse) => {
            if (response.didCancel) {
                console.log('User cancelled camera');
                return;
            }

            if (response.errorMessage) {
                Alert.alert('Lỗi', 'Không thể mở camera: ' + response.errorMessage);
                return;
            }

            if (response.assets && response.assets[0]) {
                const imageUri = response.assets[0].uri;
                if (imageUri) {
                    const uploadedImageUri = await UploadService.uploadSingleFile(imageUri);
                    setForm({ ...form, avatar: uploadedImageUri });
                }
            }
        });
    };

    const openGallery = async () => {
        const permission = await requestFilePermissions();
        if (!permission) {
            Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập bộ nhớ để chọn ảnh.');
            return;
        }
        const options: ImageLibraryOptions = {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 800,
            maxHeight: 800,
            includeBase64: false,
            selectionLimit: 1,
        };

        launchImageLibrary(options, async (response: ImagePickerResponse) => {
            if (response.didCancel) {
                console.log('User cancelled gallery');
                return;
            }

            if (response.errorMessage) {
                Alert.alert('Lỗi', 'Không thể mở thư viện ảnh: ' + response.errorMessage);
                return;
            }

            if (response.assets && response.assets[0]) {
                const imageUri = response.assets[0].uri;
                if (imageUri) {
                    const uploadedImageUri = await UploadService.uploadSingleFile(imageUri);
                    setForm({ ...form, avatar: uploadedImageUri });
                }
            }
        });
    };

    const removeImage = () => {
        setForm({ ...form, avatar: '' });
    };

    const handleSubmit = () => {
        if (!form.name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên nhóm');
            return;
        } else if (!form.friends.length) {
            Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một thành viên');
            return;
        }
        setIsLoading(true);
        dispatch(ContactActions.createGroup(
            {
                name: form.name.trim(), userIds: form.friends, avatar: form.avatar, callback: (error) => {
                    setIsLoading(false);
                    if (error) {
                        Alert.alert('Error creating group: ' + error);
                    } else {
                        setForm({ name: '', avatar: '', friends: [] as number[] });
                        setSearchFriend('');
                        handleClose();
                    }
                }
            }
        ));

    };

    const handleClose = () => {
        setForm({ name: '', avatar: '', friends: [] as number[] });
        setSearchFriend('');
        onClose();
    };
    return (
        <Modal
            visible={isOpen}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            {isLoading && <LoadingOverlay visible={isLoading} />}
            <SafeAreaView className="flex-1 bg-white">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                    <TouchableOpacity onPress={handleClose}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Tạo nhóm mới</Text>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!form.name.trim()}
                        className={`px-4 py-2 rounded-lg ${form.name.trim() ? 'opacity-100' : 'opacity-50'}`}
                        style={{ backgroundColor: colors.color1 }}
                    >
                        <Text className="text-white font-semibold">Tạo</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-1">
                    {/* Group Info Section */}
                    <View className="px-4 border-b border-gray-100">
                        {/* Group Image Upload */}
                        <View className="items-center">
                            <TouchableOpacity
                                onPress={handleImagePicker}
                                className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
                            >
                                {form.avatar ? (
                                    <View className="relative">
                                        <Image
                                            source={{ uri: form.avatar }}
                                            className="w-28 h-28 rounded-full"
                                            resizeMode="cover"
                                        />
                                        <TouchableOpacity
                                            onPress={removeImage}
                                            className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
                                        >
                                            <Ionicons name="close" size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View className="items-center">
                                        <Ionicons name="camera" size={32} color="#999" />
                                        <Text className="text-sm text-gray-500 mt-2">Thêm ảnh nhóm</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Group Name Input */}
                        <View>
                            <Text className="text-base font-medium text-gray-700 mb-3">
                                Tên nhóm *
                            </Text>
                            <Input
                                value={form.name}
                                onChangeText={(text) => setForm({ ...form, name: text })}
                                className="w-full"
                                placeholder="Nhập tên nhóm"
                                placeholderTextColor="#999"
                                maxLength={50}
                                height={50}
                                rounded={16}
                            />
                        </View>
                    </View>

                    {/* Selected Friends Summary */}
                    {form.friends.length > 0 && (
                        <View className="px-4 py-4">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row space-x-4">
                                    {form.friends.map(friendId => {
                                        const friend = listFriends.find((f: Friends) => f.id == friendId);
                                        return friend ? (
                                            <View key={friendId} className="items-center">
                                                <View className="relative">
                                                    <Image
                                                        source={{ uri: friend.avatar }}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                    <TouchableOpacity
                                                        onPress={() => toggleFriendSelection(friendId)}
                                                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                                                    >
                                                        <Ionicons name="close" size={12} color="white" />
                                                    </TouchableOpacity>
                                                </View>
                                                <Text className="text-xs text-gray-600 mt-1 max-w-16" numberOfLines={1}>
                                                    {friend.fullname}
                                                </Text>
                                            </View>
                                        ) : null;
                                    })}
                                </View>
                            </ScrollView>
                        </View>
                    )}

                    {/* Friends Selection Section */}
                    <View className="flex-1 px-4 py-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-base font-medium text-gray-700">
                                Thêm bạn bè
                            </Text>
                            <Text className="text-sm text-gray-500">
                                {form.friends.length} đã chọn
                            </Text>
                        </View>

                        {/* Search Friends */}
                        <View className="mb-4">
                            <Input
                                value={searchFriend}
                                onChangeText={setSearchFriend}
                                className="w-full"
                                placeholder="Tìm kiếm bạn bè"
                                placeholderTextColor="#999"
                                height={50}
                                rounded={16}
                            />
                        </View>

                        {/* Friends List */}
                        <FlatList
                            data={filteredFriends}
                            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const isSelected = form.friends.includes(item.id);
                                return (
                                    <TouchableOpacity
                                        onPress={() => toggleFriendSelection(item.id)}
                                        className="flex-row items-center py-3 px-2"
                                    >
                                        <Image
                                            source={{ uri: item.avatar }}
                                            className="w-12 h-12 rounded-full mr-3"
                                        />
                                        <Text className="flex-1 text-base text-gray-900">
                                            {item.fullname}
                                        </Text>
                                        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'border-gray-300 bg-white'
                                            }`}>
                                            {isSelected && (
                                                <Ionicons name="checkmark" size={14} color="white" />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

export default CreateGroupModal;
