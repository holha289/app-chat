import { colors } from "@app/styles/main.style";
import { Text, View, Animated, Easing } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRef, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@app/features";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SplashScreen = () => {
    const navigation = useNavigation()
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(0)).current;
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (isAuthenticated) {
                navigation.reset({ index: 0, routes: [{ name: "Main" }] });
            } else {
                const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
                if (!hasOnboarded) {
                    navigation.reset({ index: 0, routes: [{ name: "Start" }] });
                    return;
                }
                navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            }
        }, 2000); // chờ animation 2s

        return () => clearTimeout(timer);
    }, [isAuthenticated, navigation]);

    useEffect(() => {
        Animated.loop(
            Animated.timing(pulse, {
                toValue: 1,
                duration: 2000,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            })
        ).start();

        Animated.sequence([
            Animated.parallel([
                Animated.timing(logoScale, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.out(Easing.back(1.3)),
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View
            className="flex-1 items-center justify-center"
            style={{ backgroundColor: colors.color1 }}
        >
            {/* Background Pulse */}
            <Animated.View
                className="absolute w-80 h-80 rounded-full"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    opacity: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.6],
                    }),
                    transform: [
                        {
                            scale: pulse.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.9, 1.1],
                            }),
                        },
                    ],
                }}
            />

            {/* Logo */}
            <Animated.View
                className="w-40 h-40 rounded-full items-center justify-center mb-8"
                style={{
                    backgroundColor: colors.color1,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.2,
                    shadowRadius: 10,
                    elevation: 10,
                    opacity: logoOpacity,
                    transform: [{ scale: logoScale }],
                }}
            >
                <Ionicons name="chatbubbles-outline" size={80} color="white" />
            </Animated.View>

            {/* Text */}
            <Animated.View
                style={{ opacity: textOpacity }}
            >
                <Text
                    className="text-white text-4xl font-bold tracking-wider mb-2"
                    style={{
                        textShadowColor: 'rgba(255, 255, 255, 0.5)',
                        textShadowOffset: { width: 0, height: 2 },
                        textShadowRadius: 5,
                    }}
                >
                    WETALK
                </Text>
                <Text className="text-white text-base text-center opacity-80">
                    Kết nối - Trò chuyện - Chia sẻ
                </Text>
            </Animated.View>

            {/* Loading Dots */}
            <Animated.View
                className="flex-row mt-8"
                style={{ opacity: textOpacity }}
            >
                {[0, 1, 2].map((index) => (
                    <Animated.View
                        key={index}
                        className="w-2 h-2 rounded-full mx-1"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            opacity: pulse.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: index === 1 ? [0.3, 1, 0.3] : [0.5, 0.8, 0.5],
                            }),
                        }}
                    />
                ))}
            </Animated.View>
        </View>
    );
};

export default SplashScreen;