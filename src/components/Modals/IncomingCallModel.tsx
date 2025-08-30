import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Image,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import { colors } from '@app/styles/main.style';

interface CallModalProps {
    visible: boolean;
    onAccept: () => void;
    onDecline: () => void;
    caller?: {
        id: string;
        fullname: string;
        avatar?: string;
    } | null;
    isVideoCall?: boolean;
}

const IncomingCallModal: React.FC<CallModalProps> = ({
    visible,
    onAccept,
    onDecline,
    caller,
    isVideoCall = false
}) => {
    const defaultAvatar = 'https://via.placeholder.com/150/cccccc/ffffff?text=User';

    if (!visible) return null;

    return (
        <>
            <Modal
                visible={visible}
                animationType="fade"
                transparent={false}
                onRequestClose={onDecline}
            >
                {/* Background */}
                <View className={clsx("flex-1", `bg-[${colors.color2}]`)}>
                    {/* Header */}
                    <View className="flex-1 justify-center items-center px-8">
                        {/* Call Type Label */}
                        <Text className="text-white text-lg mb-2 opacity-80">
                            {isVideoCall ? 'Video call đến' : 'Cuộc gọi đến'}
                        </Text>

                        {/* Caller Name */}
                        <Text className="text-white text-3xl font-bold mb-8 text-center">
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
                            
                            {/* Pulse Animation Ring */}
                            <View className="absolute inset-0 w-40 h-40 rounded-full border-2 border-white/30 animate-pulse" />
                            <View className="absolute inset-2 w-36 h-36 rounded-full border border-white/20 animate-pulse" />
                        </View>

                        {/* Status Text */}
                        <Text className="text-white/70 text-lg mb-8">
                            Đang gọi...
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="pb-12 px-8">
                        <View className="flex-row justify-center items-center gap-6">
                            {/* Decline Button */}
                            <TouchableOpacity
                                onPress={onDecline}
                                className="w-16 h-16 bg-red-500 rounded-full justify-center items-center shadow-lg"
                                activeOpacity={0.8}
                            >
                                <Ionicons name="call" size={32} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
                            </TouchableOpacity>

                            {/* Accept Button */}
                            <TouchableOpacity
                                onPress={onAccept}
                                className="w-16 h-16 bg-green-500 rounded-full justify-center items-center shadow-lg"
                                activeOpacity={0.8}
                            >
                                <Ionicons 
                                    name={isVideoCall ? "videocam" : "call"} 
                                    size={32} 
                                    color="white" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default IncomingCallModal;