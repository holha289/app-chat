import { colors } from "@app/styles/main.style";
import { Text, TouchableOpacity, View, ScrollView, Dimensions } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useState, useRef, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');

const onboardingData = [
    {
        id: 1,
        title: "Chào mừng bạn đến với WETALK",
        icon: () => <Ionicons name="chatbox-ellipses-outline" size={100} color="white" />,
        description: "Khám phá những tính năng tuyệt vời của ứng dụng chat mới nhất của chúng tôi.",
    },
    {
        id: 2,
        title: "Nhắn tin ngay",
        icon: () => <Ionicons name="chatbubbles-outline" size={100} color="white" />,
        description: "Kết nối tức thời với bạn bè và gia đình thông qua tin nhắn mượt mà.",
    },
    {
        id: 3,
        title: "Trò chuyện thời gian thực",
        icon: () => <Ionicons name="time-outline" size={100} color="white" />,
        description: "Tận hưởng cuộc trò chuyện thời gian thực với phản hồi nhanh chóng và thông báo kịp thời.",
    },
    {
        id: 4,
        title: "Tham gia ngay!",
        icon: () => <Ionicons name="rocket-outline" size={100} color="white" />,
        description: "Bắt đầu kết nối với mọi người và tạo những cuộc trò chuyện thú vị ngay hôm nay.",
    }
];

const StartScreen = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const Navigate = useNavigation();

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);

            scrollViewRef.current?.scrollTo({
                x: nextIndex * width,
                animated: true
            });
        } else {
            AsyncStorage.setItem('hasOnboarded', 'true');
            Navigate.navigate("Login");
        }
    };

    const handleSkip = () => {
        AsyncStorage.setItem('hasOnboarded', 'true');
        Navigate.navigate("Login");
    };

    const onScroll = (event: any) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(slideIndex);
    };

    return (
        <View className={"flex-1 bg-white py-4"}>
            <View className={"absolute top-12 right-6 z-10"}>
                <TouchableOpacity
                    className={"px-4 py-2 rounded-full"}
                    style={{ backgroundColor: colors.color2 }}
                    onPress={handleSkip}
                >
                    <Text className={"text-white font-semibold"}>Bỏ qua</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                className={"flex-1"}
                decelerationRate="fast"
                snapToInterval={width}
                snapToAlignment="center"
            >
                {onboardingData.map((item) => (
                    <View key={item.id} style={{ width }} className={"flex-1 items-center justify-center px-8"}>
                        <View className={"items-center mb-16"}>
                            <View
                                className={"w-48 h-48 rounded-full items-center justify-center mb-8 border-4"}
                                style={{ backgroundColor: colors.color1, borderColor: colors.color1 }}
                            >
                                {item.icon && item.icon()}
                            </View>
                            <Text className={"text-3xl font-bold text-center mb-4"}>
                                {item.title}
                            </Text>
                            <Text className={"text-base text-gray-700 text-center leading-6 px-4"}>
                                {item.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View className={"px-8 pb-12"}>
                <View className={"flex-row justify-center items-center mb-8"}>
                    {onboardingData.map((_, index) => (
                        <View
                            key={index}
                            className={`w-3 h-3 rounded-full mx-1`}
                            style={{ backgroundColor: index === currentIndex ? colors.color1 : 'gray' }}
                        />
                    ))}
                </View>
                <TouchableOpacity
                    className={"p-4 rounded-full w-full items-center"}
                    onPress={handleNext}
                    style={{ backgroundColor: colors.color2 }}
                >
                    <Text className={"text-white text-lg font-semibold"}>
                        {currentIndex === onboardingData.length - 1 ? "Bắt đầu" : "Tiếp theo"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default StartScreen;
