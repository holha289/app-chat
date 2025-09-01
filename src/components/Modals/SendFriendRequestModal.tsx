import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { classBtn, colors } from '@app/styles/main.style';
import UserActions from '@app/features/user/user.action';
import { useDispatch } from 'react-redux';
import Input from '../Input';
import clsx from 'clsx';
import LoadingOverlay from '../LoadingOverlay';

interface SendFriendRequestModalProps {
    visible: boolean;
    onClose: () => void;
    user?: {
        id: string;
        fullname: string;
    } | null;
}

const SendFriendRequestModal: React.FC<SendFriendRequestModalProps> = ({
    visible,
    onClose,
    user,
}) => {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (user) {
            setMessage(`Xin chào ${user.fullname}, tôi muốn kết bạn với bạn.`);
        }
    }, [user]);

    const handleSend = () => {
        if (message.trim() && user) {
            setIsLoading(true);
            dispatch(UserActions.sendFriendRequest({
                receiveId: String(user.id),
                message,
                callback: (error) => {
                    setIsLoading(false);
                    if (error) {
                        Alert.alert("Có lỗi xảy ra", error);
                    } else {
                        Alert.alert("Thành công", "Đã gửi lời mời kết bạn");
                        onClose();
                    }
                }
            }));
        } else {
            Alert.alert('Lỗi', 'Vui lòng nhập nội dung lời mời');
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            {isLoading && <LoadingOverlay visible={isLoading} />}
            <View className="flex-1 bg-white w-full">
                <View className="bg-white rounded-2xl p-5 w-full">
                    <Text className="text-xl font-bold text-center mb-3 text-gray-800">
                        Gửi lời mời kết bạn
                    </Text>

                    {user && (
                        <Text className="text-md text-gray-600 mb-4 text-center font-medium">
                            Đến: {user.fullname}
                        </Text>
                    )}

                    <View className='mb-4'>
                        <Input
                            placeholder="Nhập lời mời kết bạn..."
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                            rounded={20}
                            height={100}
                        />
                    </View>

                    <View className="flex-row justify-between gap-4">
                        <TouchableOpacity
                            className={clsx(classBtn.outline, "flex-1 items-center mr-3")}
                            onPress={handleClose}
                        >
                            <Text className="text-base text-gray-600 font-medium">
                                Hủy
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={clsx(classBtn.primary, "flex-1 items-center ml-3")}
                            onPress={handleSend}
                        >
                            <Text className="text-base text-white font-semibold">
                                Gửi
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SendFriendRequestModal;
