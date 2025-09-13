import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Image,
    SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '@app/styles/main.style';

interface VideoCallScreenProps {
    route?: {
        params?: {
            user?: {
                id: string;
                fullname: string;
                avatar?: string;
            };
            isVideoEnabled?: boolean;
        };
    };
}

const VideoCallScreen: React.FC<VideoCallScreenProps> = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, isVideoEnabled = true } = route.params || {};
    
    // Mock user for testing
    const mockUser = {
        id: '1',
        fullname: 'Nguyễn Văn An',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    };

    // Use mock data if no user provided
    const currentUser = user || mockUser;
    
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(isVideoEnabled);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [isLocalVideoMinimized, setIsLocalVideoMinimized] = useState(false);

    const { width, height } = Dimensions.get('window');
    const defaultAvatar = 'https://via.placeholder.com/150/cccccc/ffffff?text=User';

    // Timer for call duration
    useEffect(() => {
        const timer = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Auto hide controls after 5 seconds
    useEffect(() => {
        if (showControls) {
            const timer = setTimeout(() => {
                setShowControls(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showControls]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        navigation.goBack();
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const toggleVideo = () => {
        setIsVideoOn(!isVideoOn);
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
    };

    const handleScreenTap = () => {
        setShowControls(!showControls);
    };

    const toggleLocalVideo = () => {
        setIsLocalVideoMinimized(!isLocalVideoMinimized);
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <TouchableOpacity 
                className="flex-1" 
                activeOpacity={1} 
                onPress={handleScreenTap}
            >
                {/* Remote Video View (Full screen) */}
                <View className="flex-1 relative">
                    {isVideoOn ? (
                        // Remote video area - simulate video background
                        <View className={`flex-1 bg-[${colors.color2}] justify-center items-center`}>
                            <Image
                                source={{ uri: currentUser.avatar }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                            {/* Video overlay to simulate video call */}
                            <View className="absolute inset-0 bg-black/10" />
                        </View>
                    ) : (
                        // Show avatar when remote video is off
                        <View className={`flex-1 bg-[${colors.color2}] justify-center items-center`}>
                            <View className="w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-white/20">
                                <Image
                                    source={{ uri: currentUser.avatar }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            </View>
                            <Text className="text-white text-2xl font-semibold mb-2">
                                {currentUser.fullname}
                            </Text>
                            <Text className="text-white/70 text-lg">
                                Camera đã tắt
                            </Text>
                        </View>
                    )}

                    {/* Local Video View (Picture in Picture) */}
                    {!isLocalVideoMinimized && (
                        <TouchableOpacity
                            className="absolute top-16 right-4 w-28 h-36 bg-gray-700 rounded-2xl overflow-hidden border-2 border-white/30"
                            onPress={toggleLocalVideo}
                            activeOpacity={0.8}
                        >
                            {isVideoOn ? (
                                <View className="flex-1 bg-gray-600 justify-center items-center">
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                    <View className="absolute bottom-1 right-1 bg-black/60 rounded-full p-1">
                                        <Ionicons name="videocam" size={12} color="white" />
                                    </View>
                                </View>
                            ) : (
                                <View className="flex-1 bg-gray-800 justify-center items-center">
                                    <Ionicons name="videocam-off" size={20} color="white" />
                                    <Text className="text-white text-xs mt-1">Bạn</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Minimize local video button */}
                    {isLocalVideoMinimized && (
                        <TouchableOpacity
                            className="absolute top-16 right-4 w-12 h-12 bg-black/60 rounded-full justify-center items-center border border-white/30"
                            onPress={toggleLocalVideo}
                        >
                            <Ionicons name="expand" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Top Status Bar */}
                {showControls && (
                    <View className="absolute bottom-[240px] left-0 right-0 pt-16 pb-4">
                        <View className="bg-black/50 mx-4 px-4 py-3 rounded-2xl">
                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                    <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                                    <Text className="text-white font-medium text-lg">
                                        {formatTime(callDuration)}
                                    </Text>
                                </View>
                                
                                <Text className="text-white font-semibold text-lg">
                                    {currentUser.fullname}
                                </Text>

                                <TouchableOpacity 
                                    className="w-8 h-8 justify-center items-center"
                                    onPress={() => navigation.goBack()}
                                >
                                    <Ionicons name="chevron-down" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Bottom Controls */}
                {showControls && (
                    <View className="absolute bottom-5 left-0 right-0 pb-12">
                        <View className="bg-black/50 mx-4 px-6 py-6 rounded-3xl">
                            {/* Main Controls */}
                            <View className="flex-row justify-center items-center gap-2">
                                {/* Mute Button */}
                                <TouchableOpacity
                                    className={`w-16 h-16 rounded-full justify-center items-center ${
                                        isMuted ? 'bg-red-500' : 'bg-white/20'
                                    }`}
                                    onPress={toggleMute}
                                >
                                    <Ionicons 
                                        name={isMuted ? "mic-off" : "mic"} 
                                        size={28} 
                                        color="white" 
                                    />
                                </TouchableOpacity>
                                 {/* Speaker Toggle */}
                                <TouchableOpacity
                                    className={`w-16 h-16 rounded-full justify-center items-center ${
                                        isSpeakerOn ? 'bg-blue-500/80' : 'bg-white/20'
                                    }`}
                                    onPress={toggleSpeaker}
                                >
                                    <Ionicons 
                                        name={isSpeakerOn ? "volume-high" : "volume-low"} 
                                        size={20} 
                                        color="white" 
                                    />
                                </TouchableOpacity>

                                {/* Switch Camera */}
                                <TouchableOpacity className="w-16 h-16 rounded-full justify-center items-center bg-white/20">
                                    <Ionicons name="camera-reverse" size={20} color="white" />
                                </TouchableOpacity>

                                {/* Video Toggle Button */}
                                <TouchableOpacity
                                    className={`w-16 h-16 rounded-full justify-center items-center ${
                                        !isVideoOn ? 'bg-red-500' : 'bg-white/20'
                                    }`}
                                    onPress={toggleVideo}
                                >
                                    <Ionicons 
                                        name={isVideoOn ? "videocam" : "videocam-off"} 
                                        size={28} 
                                        color="white" 
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Secondary Controls */}
                            <View className="flex-row justify-center items-center space-x-16 mt-6">
                               
                                 {/* End Call Button */}
                                <TouchableOpacity
                                    className="w-16 h-16 bg-red-500 rounded-full justify-center items-center shadow-lg"
                                    onPress={handleEndCall}
                                >
                                    <Ionicons 
                                        name="call" 
                                        size={32} 
                                        color="white" 
                                        style={{ transform: [{ rotate: '135deg' }] }} 
                                    />
                                </TouchableOpacity>

                                {/* More Options
                                <TouchableOpacity className="w-12 h-12 rounded-full justify-center items-center bg-white/20">
                                    <Ionicons name="ellipsis-horizontal" size={20} color="white" />
                                </TouchableOpacity> */}
                            </View>
                        </View>
                    </View>
                )}

                {/* Connection Status */}
                <View className="absolute top-20 left-4">
                    <View className="bg-green-500/80 px-2 py-1 rounded-full flex-row items-center">
                        <View className="w-2 h-2 bg-white rounded-full mr-1" />
                        <Text className="text-white text-xs font-medium">Kết nối tốt</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default VideoCallScreen;