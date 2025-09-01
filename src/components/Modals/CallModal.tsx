import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@app/styles/main.style';
import { Friends } from '@app/features/types/contact.type';
import CallComponent from '../CallComponent';

interface CallModalProps {
    visible: boolean;
    onAccept: () => void;
    onDecline: () => void;
    caller?: Friends | null;
    isVideoCall?: boolean;
    isTo?: boolean;
    isAccepted?: boolean;
    roomId?: string | null;
}

const CallModal: React.FC<CallModalProps> = ({
    visible,
    onAccept,
    onDecline,
    caller,
    isVideoCall = false,
    isTo = false,
    isAccepted = false,
    roomId = null
}) => {
    const defaultAvatar = 'https://via.placeholder.com/150/cccccc/ffffff?text=User';

    if (!visible) {
      return null;
    }

    // --- Render khi đã accepted ---
    if (isAccepted && roomId && caller) {
        return (
            <Modal
                visible={visible}
                animationType="slide"
                transparent={false}
                onRequestClose={onDecline}
            >
                <CallComponent
                    currentUser={caller}
                />
            </Modal>
        );
    }

    // --- Render khi chưa accepted ---
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onDecline}
        >
            <View className="flex-1" style={{ backgroundColor: colors.color2 }}>
                <View className="flex-1 justify-center items-center px-8">
                    {/* Call Type Label */}
                    {!isAccepted && (
                        <Text className="text-white text-lg mb-2 opacity-80">
                            {isTo ? 'Bạn có cuộc gọi đến từ' : 'Bạn đã gọi đến'}
                        </Text>
                    )}

                    {/* Caller Name */}
                    <Text className="text-white text-2xl font-bold mb-8 text-center">
                        {caller?.fullname || 'Unknown'}
                    </Text>

                    {/* Avatar */}
                    <View className="mb-12">
                        <View className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/20">
                            <Image
                                source={{ uri: caller?.avatar || defaultAvatar }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>
                    </View>

                    {/* Status Text */}
                    {isAccepted ? (
                        <Text className="text-white/70 text-lg mb-8">Đã kết nối</Text>
                    ) : (
                        <Text className="text-white/70 text-lg mb-8">
                            Đang gọi...
                        </Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View className="pb-12 px-8">
                    <View className="flex-row justify-center items-center space-x-6">
                        {/* Decline Button */}
                        <TouchableOpacity
                            onPress={onDecline}
                            className="w-16 h-16 bg-red-500 rounded-full justify-center items-center shadow mr-4"
                            activeOpacity={0.8}
                        >
                            <Ionicons name="call" size={32} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
                        </TouchableOpacity>

                        {/* Accept Button */}
                        {isTo && !isAccepted && (
                            <TouchableOpacity
                                onPress={onAccept}
                                className="w-16 h-16 bg-green-500 rounded-full justify-center items-center shadow"
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={isVideoCall ? "videocam" : "call"}
                                    size={32}
                                    color="white"
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CallModal;
