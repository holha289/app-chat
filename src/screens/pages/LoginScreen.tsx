import { Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Input from "@app/components/Input";
import { loginClassStyle, LoginStyle } from "@app/styles/login.style";
import { classBtn, classFontSize, colors } from "@app/styles/main.style";

const LoginScreen = () => {
    const [form, setForm] = useState({
        phone: "",
        password: "",
    });
    const navigation = useNavigation();

    const handleLogin = () => {
        navigation.navigate("Home");
    };

    const handleCreateAccount = () => {
        navigation.navigate("Register");
    };

    return (
        <ScrollView className="flex-1">
            <View className={loginClassStyle.container}>
                <View className={loginClassStyle.header}>
                    <Text className={loginClassStyle.title}>
                        Đăng nhập
                    </Text>
                    <Text className={loginClassStyle.subtitle}>
                        Chào mừng bạn trở lại!
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
                        <Text className={`font-bold ${classFontSize["base"]}`}>
                           Quên mật khẩu?
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`rounded-xl items-center mb-6`}
                        style={LoginStyle.btnLogin}
                        onPress={handleLogin}
                    >
                        <Text className={`font-semibold text-white ${classFontSize["lg"]}`}>
                            Đăng nhập
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`rounded-xl items-center mb-6`}
                        style={LoginStyle.btnCreateAccount}
                        onPress={handleCreateAccount}
                    >
                        <Text className={`text-black ${classFontSize["lg"]} font-semibold`}>
                            Tạo tài khoản mới
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default LoginScreen;