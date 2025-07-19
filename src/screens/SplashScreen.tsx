import { colors } from "@app/styles/main.style";
import { Text, View, Animated, Easing, Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRef, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get('window');

const SplashScreen = () => {
    const Navigate = useNavigation();

    // Animation values for splash logo
    const logoAnimations = useRef({
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
        rotate: new Animated.Value(0),
    }).current;

    useEffect(() => {
        logoAnimations.scale.setValue(0);
        logoAnimations.opacity.setValue(0);
        logoAnimations.rotate.setValue(0);
        Animated.sequence([
            Animated.parallel([
                Animated.timing(logoAnimations.scale, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
                Animated.timing(logoAnimations.opacity, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(logoAnimations.rotate, {
                toValue: 1,
                duration: 1000,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            }),
        ]).start();
        setTimeout(() => {
            Navigate.navigate("Start");
        }, 2500);
    }, []);

    return (
        <View 
            className={"flex-1 items-center justify-center"}
            style={{ backgroundColor: colors.color1 }}
        >
            <Animated.View
                className={"w-48 h-48 rounded-full items-center justify-center mb-8 border-4"}
                style={{ 
                    backgroundColor: colors.color1, 
                    borderColor: colors.color1,
                    opacity: logoAnimations.opacity,
                    transform: [
                        { scale: logoAnimations.scale },
                        { 
                            rotate: logoAnimations.rotate.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                            })
                        }
                    ]
                }}
            >
                <Ionicons name="chatbubbles-outline" size={100} color="white" />
            </Animated.View>
            <Text className={"text-white text-3xl font-bold"}>WETALK</Text>
        </View>
    );
};


export default SplashScreen;