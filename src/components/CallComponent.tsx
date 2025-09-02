import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RTCView } from 'react-native-webrtc';
import Helpers from '@app/utils/helpers';
import { useWebRTC } from '@app/hooks/use-webrtc';
import { useSelector } from 'react-redux';
import { selectCall } from '@app/features/user/user.selecter';
import { colors } from '@app/styles/main.style';
import { Friends } from '@app/features/types/contact.type';
import { selectUser } from '@app/features';
import { useDispatch } from 'react-redux';
import UserActions from '@app/features/user/user.action';

type Props = {
    currentUser: Friends;
};

const CallComponent: React.FC<Props> = ({
    currentUser
}) => {
    const user = useSelector(selectUser);
    const accepted = useSelector(selectCall);
    const dispatch = useDispatch();
    const {
        localStream,
        remoteStream,
        toggleMute,
        toggleSpeaker,
        toggleVideo,
        switchCamera,
        hangUp,
        callee,
        caller,
        listenCall,
        isMuted,
        isSpeakerOn,
        isVideoOff
    } = useWebRTC(accepted?.isVideoCall ?? false);

    // Use ref to prevent unnecessary re-renders
    const hasInitialized = useRef(false);
    const currentAcceptedId = useRef<string | null>(null);

    // Memoize currentUser data để tránh re-render
    const userInfo = useMemo(() => ({
        fullname: currentUser.fullname,
        avatar: currentUser.avatar
    }), [currentUser.fullname, currentUser.avatar]);

    // Debug streams - sử dụng dependency chính xác
    useEffect(() => {
        if (localStream) {
            console.log("🎬 Local stream tracks:", localStream.getTracks().length);
        }
    }, [!!localStream]); // Chỉ theo dõi sự tồn tại của stream

    useEffect(() => {
        if (remoteStream) {
            console.log("📺 Remote stream tracks:", remoteStream.getTracks().length);
        }
    }, [!!remoteStream]); // Chỉ theo dõi sự tồn tại của stream

    // Tối ưu call logic
    useEffect(() => {
        if (!accepted || !user || accepted.category !== 'accept') {
            return;
        }

        // Tránh khởi tạo lại nếu đã xử lý cuộc gọi này rồi
        const callId = `${accepted.roomId}-${accepted.from?.id}-${accepted.to?.id}`;
        if (hasInitialized.current && currentAcceptedId.current === callId) {
            return;
        }

        console.log("📞 Initializing call:", callId);

        // Đánh dấu đã khởi tạo
        hasInitialized.current = true;
        currentAcceptedId.current = callId;

        // Khởi tạo call logic
        const initializeCall = async () => {
            try {
                listenCall();

                const userCaller = accepted.to;
                const userCallee = accepted.from;
                const iAmCaller = userCaller?.id?.toString() === user?.id?.toString();
                const partnerId = iAmCaller ? userCallee?.id?.toString() : userCaller?.id?.toString();

                if (iAmCaller) {
                    await caller(accepted.roomId as string, partnerId as string);
                } else {
                    await callee(accepted.roomId as string, partnerId as string);
                }
            } catch (error) {
                console.error("❌ Error initializing call:", error);
            }
        };

        initializeCall();

        // Cleanup function
        return () => {
            console.log("🧹 Cleaning up call");
            hangUp();
            hasInitialized.current = false;
            currentAcceptedId.current = null;
        };
    }, [accepted?.roomId, accepted?.category, user?.id]); // Chỉ dependency cần thiết

    // State cho UI
    const [isLocalVideoMinimized, setIsLocalVideoMinimized] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [callDuration, setCallDuration] = useState(0);

    // Timer cho call duration
    useEffect(() => {
        if (!accepted || accepted.category !== 'accept') return;

        const timer = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [accepted?.category]); // Chỉ chạy khi call được accept

    // Memoize handlers để tránh re-render con
    const handleScreenTap = useCallback(() => {
        setShowControls((v) => !v);
    }, []);

    const handleEndCall = useCallback(() => {
        hangUp();
        const userTo = accepted.to?.id !== user?.id ? accepted.to : accepted.from;
        dispatch(UserActions.call({
            roomId: accepted.roomId as string,
            from: user as unknown as Friends,
            to: userTo as Friends,
            isVideoCall: accepted.isVideoCall,
            category: 'reject'
        }));
    }, [accepted, hangUp, dispatch]);

    const handleToggleMute = useCallback(() => {
        toggleMute?.();
    }, [toggleMute]);

    const handleToggleSpeaker = useCallback(() => {
        toggleSpeaker?.();
    }, [toggleSpeaker]);

    const handleToggleVideo = useCallback(() => {
        if (!accepted?.isVideoCall && isVideoOff) {
            return;
        }
        toggleVideo?.();
    }, [accepted?.isVideoCall, isVideoOff, toggleVideo]);

    const handleToggleLocalVideo = useCallback(() => {
        setIsLocalVideoMinimized((v) => !v);
    }, []);

    const handleSwitchCamera = useCallback(() => {
        switchCamera?.();
    }, [switchCamera]);

    // Memoize video display logic
    const showRemoteVideo = useMemo(() => {
        return accepted?.isVideoCall && remoteStream;
    }, [accepted?.isVideoCall, !!remoteStream]);

    const showLocalVideo = useMemo(() => {
        return !isVideoOff && localStream;
    }, [isVideoOff, !!localStream]);

    console.log("remoteStream", remoteStream, localStream)
    return (
        <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={handleScreenTap}
        >
            {/* Remote Video View */}
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.color2 }}>
                {showRemoteVideo ? (
                    <RTCView
                        streamURL={(remoteStream as any).toURL?.()}
                        style={{ width: '100%', height: '100%' }}
                        objectFit="cover"
                    />
                ) : (
                    <View className="justify-center items-center">
                        <Image
                            source={{ uri: userInfo.avatar }}
                            style={{
                                width: 160,
                                height: 160,
                                borderRadius: 80,
                                marginBottom: 24,
                                borderWidth: 4,
                                borderColor: 'rgba(255,255,255,0.2)',
                                overflow: 'hidden',
                            }}
                            resizeMode="cover"
                        />
                        <Text className="text-white text-xl font-bold mb-2">
                            {userInfo.fullname}
                        </Text>
                        <Text className="text-white/70 text-lg">
                            {accepted?.isVideoCall ? 'Camera đã tắt' : 'Cuộc gọi thoại'}
                        </Text>
                    </View>
                )}

                {/* Local Video */}
                {accepted?.isVideoCall && !isLocalVideoMinimized && (
                    <TouchableOpacity
                        className="absolute top-16 right-4 w-28 h-36 bg-neutral-800 rounded-xl overflow-hidden border-2 border-white/30"
                        onPress={handleToggleLocalVideo}
                        activeOpacity={0.8}
                    >
                        {showLocalVideo ? (
                            <RTCView
                                streamURL={(localStream as any).toURL?.()}
                                style={{ width: '100%', height: '100%' }}
                                objectFit="cover"
                            />
                        ) : (
                            <View className="flex-1 justify-center items-center bg-neutral-900">
                                <Ionicons name="videocam-off" size={20} color="white" />
                                <Text className="text-white text-xs mt-1">Bạn</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}

                {/* Minimize local video button */}
                {accepted?.isVideoCall && isLocalVideoMinimized && (
                    <TouchableOpacity
                        className="absolute top-16 right-4 w-12 h-12 bg-black/60 rounded-full justify-center items-center border border-white/30"
                        onPress={handleToggleLocalVideo}
                    >
                        <Ionicons name="expand" size={20} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Top Status Bar */}
            {showControls && (
                <View className="absolute bottom-[240px] left-0 right-0 pt-16 pb-4">
                    <View className="bg-black/50 mx-4 px-4 py-3 rounded-xl">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                                <Text className="text-white font-medium text-lg">
                                    {Helpers.formatTime(callDuration)}
                                </Text>
                            </View>
                            <Text className="text-white font-bold text-lg">
                                {currentUser.fullname}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Bottom Controls */}
            {showControls && (
                <View className="absolute bottom-5 left-0 right-0 pb-12">
                    <View className="bg-black/50 mx-4 px-6 py-6 rounded-2xl">
                        <View className="flex-row justify-center items-center gap-3">
                            {/* Mute Button */}
                            <TouchableOpacity
                                className={`w-16 h-16 rounded-full justify-center items-center ${isMuted ? 'bg-red-500' : 'bg-white/20'}`}
                                onPress={handleToggleMute}
                            >
                                <Ionicons
                                    name={isMuted ? "mic-off" : "mic"}
                                    size={28}
                                    color="white"
                                />
                            </TouchableOpacity>

                            {/* Speaker Toggle */}
                            <TouchableOpacity
                                className={`w-16 h-16 rounded-full justify-center items-center ${isSpeakerOn ? 'bg-blue-500' : 'bg-white/20'}`}
                                onPress={handleToggleSpeaker}
                            >
                                <Ionicons
                                    name={isSpeakerOn ? "volume-high" : "volume-low"}
                                    size={20}
                                    color="white"
                                />
                            </TouchableOpacity>

                            {/* Các điều khiển video chỉ hiển thị nếu là cuộc gọi video */}
                            {accepted?.isVideoCall && (
                                <>
                                    {/* Switch Camera */}
                                    <TouchableOpacity
                                        className="w-16 h-16 rounded-full justify-center items-center bg-white/20"
                                        onPress={handleSwitchCamera}
                                    >
                                        <Ionicons name="camera-reverse" size={20} color="white" />
                                    </TouchableOpacity>

                                    {/* Video Toggle Button */}
                                    <TouchableOpacity
                                        className={`w-16 h-16 rounded-full justify-center items-center ${isVideoOff ? 'bg-red-500' : 'bg-white/20'}`}
                                        onPress={handleToggleVideo}
                                    >
                                        <Ionicons
                                            name={isVideoOff ? "videocam-off" : "videocam"}
                                            size={28}
                                            color="white"
                                        />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        {/* End Call Button */}
                        <View className="flex-row justify-center items-center mt-6">
                            <TouchableOpacity
                                className="w-16 h-16 bg-red-500 rounded-full justify-center items-center shadow"
                                onPress={handleEndCall}
                            >
                                <Ionicons
                                    name="call"
                                    size={32}
                                    color="white"
                                    style={{ transform: [{ rotate: '135deg' }] }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default CallComponent;