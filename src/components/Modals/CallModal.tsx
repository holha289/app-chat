import React, { useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@app/styles/main.style';
import { Friends } from '@app/features/types/contact.type';
import { RTCView } from 'react-native-webrtc';

interface CallModalProps {
    visible: boolean;
    onAccept: () => void;
    onDecline: () => void;
    userInfo?: Friends | null;
    isVideoCall?: boolean;
    isTo?: boolean;
    isAccepted?: boolean;
    roomId?: string | null;
    webRTC: {
        localStream: MediaStream | null;
        remoteStream: MediaStream | null;
        connectState: 'idle' | 'connecting' | 'connected' | 'failed';
        toggleVideo: () => void;
        toggleAudio: () => void;
        switchCamera: () => void;
        toggleSpeakerphone: () => void;
        isVideoEnabled: boolean;
        isAudioEnabled: boolean;
        isSwitchingCamera: boolean;
        isSpeakerOn: boolean;
    };
}

const CallModal: React.FC<CallModalProps> = ({
    visible,
    onAccept,
    onDecline,
    userInfo,
    isVideoCall = false,
    isTo = false,
    isAccepted = false,
    roomId = null,
    webRTC
}) => {
    const defaultAvatar = 'https://via.placeholder.com/150/cccccc/ffffff?text=User';
    // Auto close modal nếu không accepted trong 30 giây
    useEffect(() => {
        if (visible && !isAccepted) {
            const timer = setTimeout(() => {
                onDecline();
            }, 30000); // 30 giây
            return () => clearTimeout(timer);
        }
    }, [visible, isAccepted, onDecline]);

    // Trả về null nếu modal không hiển thị
    if (!visible) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onDecline}
        >
            <View className="flex-1" style={{ backgroundColor: colors.color2 }}>
                <View className="flex-1 justify-center items-center">
                    {isAccepted ? (
                        <>
                            {isVideoCall ? (
                                <View className="flex-1 relative w-full">
                                    {/* Remote Stream (full screen) */}
                                    {webRTC.remoteStream ? (
                                        <RTCView
                                            streamURL={(webRTC.remoteStream as any).toURL?.()}
                                            style={{ width: '100%', height: '100%' }}
                                            objectFit="cover"
                                            zOrder={0}
                                        />
                                    ) : (
                                        <View className="flex-1 justify-center items-center">
                                            <Text className="text-white text-lg">Đang kết nối...</Text>
                                        </View>
                                    )}

                                    {/* Local Stream (picture-in-picture) */}
                                    {webRTC.localStream && (
                                        <View className="absolute top-4 right-4 w-28 h-36 bg-black/50 rounded-lg overflow-hidden border-2 border-white/30">
                                            <RTCView
                                                streamURL={(webRTC.localStream as any).toURL?.()}
                                                style={{ width: '100%', height: '100%' }}
                                                objectFit="cover"
                                                mirror={true}
                                                zOrder={1}
                                            />
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View className="flex-1 justify-center items-center">
                                    {/* Avatar cho cuộc gọi thoại */}
                                    <View className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/20 mb-8">
                                        <Image
                                            source={{ uri: userInfo?.avatar || defaultAvatar }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <Text className="text-white text-2xl font-bold mb-4">
                                        {userInfo?.fullname || "Unknown"}
                                    </Text>
                                    <Text className="text-white/70 text-lg">
                                        Đang trong cuộc gọi...
                                    </Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Hiển thị local video khi đang chờ kết nối */}
                            {isVideoCall ? (
                                <View className="flex-1 relative w-full">
                                    {webRTC.localStream ? (
                                        <RTCView
                                            streamURL={(webRTC.localStream as any).toURL?.()}
                                            style={{ width: '100%', height: '100%' }}
                                            objectFit="cover"
                                            mirror={true}
                                        />
                                    ) : (
                                        <View className="flex-1 justify-center items-center">
                                            <Text className="text-white text-lg">Đang khởi tạo camera...</Text>
                                        </View>
                                    )}

                                    {/* Thông tin cuộc gọi */}
                                    <View className="absolute top-4 left-0 right-0 px-4">
                                        <View className="bg-black/50 px-4 py-3 rounded-xl">
                                            <Text className="text-white text-center text-lg">
                                                {isTo ? 'Cuộc gọi video đến' : 'Đang gọi video...'}
                                            </Text>
                                            <Text className="text-white text-center text-xl font-bold">
                                                {userInfo?.fullname || "Unknown"}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View className="flex-1 justify-center items-center">
                                    {/* Call Direction Label */}
                                    <Text className="text-white text-lg mb-2 opacity-80">
                                        {isTo ? 'Bạn có cuộc gọi đến từ' : 'Bạn đã gọi đến'}
                                    </Text>
                                    {/* Tên người dùng */}
                                    <Text className="text-white text-2xl font-bold mb-8 text-center">
                                        {userInfo?.fullname || 'Unknown'}
                                    </Text>
                                    {/* Avatar */}
                                    <View className="mb-12">
                                        <View className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/20">
                                            <Image
                                                source={{ uri: userInfo?.avatar || defaultAvatar }}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        </View>
                                    </View>
                                    <Text className="text-white/70 text-lg mb-8">
                                        Đang gọi...
                                    </Text>
                                </View>
                            )}
                        </>
                    )}
                </View>

                {/* Action Buttons - Absolute position at bottom */}
                <View className="absolute bottom-0 left-0 right-0 pb-12 px-8">
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

                        {isAccepted && (
                            <View className="flex-row gap-4">
                                {/* Toggle Audio Button */}
                                <TouchableOpacity
                                    onPress={() => webRTC.toggleAudio()}
                                    className={`w-16 h-16 rounded-full justify-center items-center shadow ${webRTC.isAudioEnabled ? "bg-green-500" : "bg-gray-500"}`}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={webRTC.isAudioEnabled ? "mic" : "mic-off"}
                                        size={32}
                                        color="white"
                                    />
                                </TouchableOpacity>

                                {/* Toggle Video Button */}
                                {isVideoCall && (
                                    <>
                                        {/* Toggle Speakerphone Button */}
                                        <TouchableOpacity
                                            onPress={() => webRTC.toggleSpeakerphone()}
                                            className={`w-16 h-16 rounded-full justify-center items-center shadow ${webRTC.isSpeakerOn ? "bg-green-500" : "bg-gray-500"}`}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons
                                                name={webRTC.isSpeakerOn ? "volume-high" : "volume-mute"}
                                                size={32}
                                                color="white"
                                            />
                                        </TouchableOpacity>
                                        {/* Switch Camera Button */}
                                        <TouchableOpacity
                                            onPress={() => webRTC.switchCamera()}
                                            className={`w-16 h-16 rounded-full justify-center items-center shadow ${webRTC.isSwitchingCamera ? "bg-green-500" : "bg-gray-500"}`}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons
                                                name="camera-reverse"
                                                size={32}
                                                color="white"
                                            />
                                        </TouchableOpacity>
                                        {/* Video Toggle Button */}
                                        <TouchableOpacity
                                            onPress={() => webRTC.toggleVideo()}
                                            className={`w-16 h-16 rounded-full justify-center items-center shadow ${webRTC.isVideoEnabled ? "bg-green-500" : "bg-gray-500"}`}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons
                                                name={webRTC.isVideoEnabled ? "videocam" : "videocam-off"}
                                                size={32}
                                                color="white"
                                            />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CallModal;
