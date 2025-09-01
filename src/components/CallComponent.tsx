import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RTCView } from 'react-native-webrtc';
import Helpers from '@app/utils/helpers';
import { useWebRTC } from '@app/hooks/use-webrtc';
import { useSelector } from 'react-redux';
import { selectCall } from '@app/features/user/user.selecter';
import { getSocket } from '@app/core/socketIo';
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
        setIsVoiceOnly,
        listenCall
    } = useWebRTC();

    // Debug streams
    useEffect(() => {
        console.log("🎬 Local stream available:", !!localStream);
        if (localStream) {
            console.log("🎬 Local tracks:", localStream.getTracks().map(t => ({
                kind: t.kind,
                enabled: t.enabled,
                id: t.id
            })));
        }
    }, [localStream]);

    useEffect(() => {
        console.log("📺 Remote stream available:", !!remoteStream);
        if (remoteStream) {
            console.log("📺 Remote tracks:", remoteStream.getTracks().map(t => ({
                kind: t.kind,
                enabled: t.enabled,
                id: t.id
            })));
        }
    }, [remoteStream]);

    useEffect(() => {
        console.log("📞 Call accepted:", accepted);
        if (accepted && user && accepted.category === 'accept') {
            // Đảm bảo bắt đầu lắng nghe tín hiệu trước
            listenCall();
            
            const userCaller = accepted.to; // người gọi
            const userCallee = accepted.from; // người nhận
            // Xác định rõ vai trò của người dùng hiện tại
            const iAmCaller = userCaller?.id?.toString() === user?.id?.toString();
            // Nếu là người gọi thì lấy userCallee, ngược lại lấy userCaller
            const partnerId = iAmCaller ? userCallee?.id?.toString() : userCaller?.id?.toString();
            // Đặt isVoiceOnly dựa trên loại cuộc gọi
            // - Nếu isVideoCall = true: đặt isVoiceOnly = false (cuộc gọi video)
            // - Nếu isVideoCall = false: đặt isVoiceOnly = true (cuộc gọi thoại)
            setIsVoiceOnly(!accepted.isVideoCall);
            // Nếu là cuộc gọi thoại, cập nhật UI ngay lập tức
            if (!accepted.isVideoCall) {
                setIsVideoOn(false);
            }
            
            // Tạo kết nối dựa trên vai trò
            if (iAmCaller) {
                caller(accepted.roomId as string, partnerId as string);
            } else {
                callee(accepted.roomId as string, partnerId as string);
            }
        }
        
        // Cleanup khi component unmount hoặc khi accepted thay đổi
        return () => {
            if (accepted && accepted.category === 'reject') {
                console.log("🧹 Cleaning up WebRTC resources due to call rejection or component unmount");
                hangUp();
            }
        };
    }, [accepted, user]);

    // UI states
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    // Khởi tạo isVideoOn dựa trên loại cuộc gọi
    const [isVideoOn, setIsVideoOn] = useState(accepted ? accepted.isVideoCall : true);
    const [isLocalVideoMinimized, setIsLocalVideoMinimized] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    
    // Theo dõi thay đổi loại cuộc gọi
    useEffect(() => {
        if (accepted) {
            // Nếu không phải video call, tắt video
            if (!accepted.isVideoCall) {
                setIsVideoOn(false);
            }
        }
    }, [accepted?.isVideoCall]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // UI handlers
    const handleScreenTap = () => setShowControls((v) => !v);
    const handleEndCall = () => {
        hangUp();
        if (accepted && accepted.from && accepted.to) {
            dispatch(UserActions.call({
                ...accepted,
                category: 'reject',
                from: accepted.from,
                to: accepted.to
            }))
        }
    };

    const handleToggleMute = () => {
        setIsMuted((v) => !v);
        toggleMute && toggleMute();
    };
    const handleToggleSpeaker = () => {
        setIsSpeakerOn((v) => !v);
        toggleSpeaker && toggleSpeaker(isSpeakerOn);
    };
    const handleToggleVideo = () => {
        // Nếu không phải cuộc gọi video, không cho phép bật video
        if (!accepted?.isVideoCall && !isVideoOn) {
            return;
        }
        setIsVideoOn((v) => !v);
        toggleVideo && toggleVideo();
    };
    const handleToggleLocalVideo = () => setIsLocalVideoMinimized((v) => !v);
    const handleSwitchCamera = () => switchCamera && switchCamera();

    console.log("remoteStream", remoteStream, localStream)
    return (
        <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={handleScreenTap}
        >
            {/* Remote Video View (Full screen) */}
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.color2 }}>
                {/* Nếu là cuộc gọi video, có remoteStream và video đang bật -> Hiển thị video */}
                {accepted?.isVideoCall && isVideoOn && remoteStream ? (
                    <RTCView
                        streamURL={(remoteStream as any).toURL?.()}
                        style={{ width: '100%', height: '100%' }}
                        objectFit="cover"
                    />
                ) : (
                    /* Trường hợp không hiển thị video: cuộc gọi thoại hoặc video bị tắt */
                    <View className="justify-center items-center">
                        <Image
                            source={{ uri: currentUser.avatar }}
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
                            {currentUser.fullname}
                        </Text>
                        <Text className="text-white/70 text-lg">
                            {accepted?.isVideoCall ? 'Camera đã tắt' : 'Cuộc gọi thoại'}
                        </Text>
                    </View>
                )}

                {/* Local Video View (Picture in Picture) - Chỉ hiển thị nếu là cuộc gọi video */}
                {accepted?.isVideoCall && !isLocalVideoMinimized && (
                    <TouchableOpacity
                        className="absolute top-16 right-4 w-28 h-36 bg-neutral-800 rounded-xl overflow-hidden border-2 border-white/30"
                        onPress={handleToggleLocalVideo}
                        activeOpacity={0.8}
                    >
                        {isVideoOn && localStream ? (
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
                                        className={`w-16 h-16 rounded-full justify-center items-center ${!isVideoOn ? 'bg-red-500' : 'bg-white/20'}`}
                                        onPress={handleToggleVideo}
                                    >
                                        <Ionicons
                                            name={isVideoOn ? "videocam" : "videocam-off"}
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