import {
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Input from "@app/components/Input";
import { loginClassStyle } from "@app/styles/login.style";
import { classBtn } from "@app/styles/main.style";
import authActions from "@app/features/auth/auth.action";
import { selectAuthLoading, selectAuthError, selectIsAuthenticated } from "@app/features";
import { useSelector, useDispatch } from "react-redux";
import clsx from "clsx";
import LoadingOverlay from "@app/components/LoadingOverlay";

const LoginScreen = () => {
    const [form, setForm] = useState({
        phone: "",
        password: "",
    });
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const errorLogin = useSelector(selectAuthError);
    const isLoading: boolean = useSelector(selectAuthLoading);

    function handleLogin() {
        dispatch(authActions.login({
            phone: form.phone,
            password: form.password,
            callback: (error) => {
                if (error) {
                    Alert.alert("Đăng nhập thất bại", error);
                } else {
                    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
                }
            },
        }));
    }

    const handleCreateAccount = () => {
        navigation.navigate("Register");
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-white">
            <LoadingOverlay visible={isLoading} />
            <View className={loginClassStyle.container}>
                <View className={loginClassStyle.header}>
                    <Text className={loginClassStyle.title}>
                        Đăng nhập
                    </Text>
                    <Text className={loginClassStyle.subtitle}>
                        Hãy đăng nhập để kết nối, trò chuyện và khám phá những điều thú vị trong ứng dụng chat của chúng tôi.
                    </Text>
                </View>
                <View className={loginClassStyle.inputContainer}>
                    <View className={loginClassStyle.input}>
                        <Input
                            placeholder="Số điện thoại"
                            placeholderTextColor='#9CA3AF'
                            value={form.phone}
                            onChangeText={(text) => setForm({ ...form, phone: text })}
                            keyboardType="number-pad"
                            autoCapitalize="none"
                            rounded={12}
                            height={50}
                        />
                    </View>
                    <View className={loginClassStyle.input}>
                        <Input
                            placeholder="Mật khẩu"
                            placeholderTextColor="#9CA3AF"
                            value={form.password}
                            onChangeText={(text) => setForm({ ...form, password: text })}
                            secureTextEntry
                            rounded={12}
                            height={50}
                        />
                    </View>
                    <TouchableOpacity className={loginClassStyle.forgotPassword}>
                        <Text className="font-bold text-base text-blue-600">
                            Quên mật khẩu?
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={clsx(classBtn.primary, 'mb-4')}
                        onPress={handleLogin}
                    >
                        <Text className={classBtn.primaryText}>
                            Đăng nhập
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={classBtn.secondary}
                        onPress={handleCreateAccount}
                    >
                        <Text className={classBtn.outlineText}>
                            Tạo tài khoản mới
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
