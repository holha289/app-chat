import { Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { registerClassStyle, RegisterStyle } from "@app/styles/register.style";
import Input from "@app/components/Input";

const RegisterScreen = () => {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const navigation = useNavigation();

    const handleSignUp = () => {
        navigation.navigate("Home");
    };

    const handleAlreadyHaveAccount = () => {
        navigation.goBack();
    };

    return (
        <ScrollView className={registerClassStyle.container}>
            <View className={registerClassStyle.header}>
                <Text className={registerClassStyle.title}>
                    Đăng ký tài khoản
                </Text>
                <Text className={registerClassStyle.subtitle}>
                    Tạo một tài khoản để bạn có thể khám phá tất cả các công việc hiện có
                </Text>
            </View>
             
            <View className={registerClassStyle.inputContainer}>
                <View className={registerClassStyle.input}>
                    <Input
                        placeholder="Họ và tên"
                        placeholderTextColor='#9CA3AF'
                        value={form.name}
                        onChangeText={(text) => setForm({ ...form, name: text })}
                        rounded={12}
                        height={50}
                    />
                </View>
                <View className={registerClassStyle.input}>
                    <Input
                        placeholder="Số điện thoại"
                        placeholderTextColor='#9CA3AF'
                        value={form.phone}
                        onChangeText={(text) => setForm({ ...form, phone: text })}
                        keyboardType="number-pad"
                        rounded={12}
                        height={50}
                    />
                </View>
                <View className={registerClassStyle.input}>
                    <Input
                        placeholder="Email"
                        placeholderTextColor='#9CA3AF'
                        value={form.email}
                        onChangeText={(text) => setForm({ ...form, email: text })}
                        keyboardType="email-address"
                        rounded={12}
                        height={50}
                    />
                </View>
                <View className={registerClassStyle.input}>
                    <Input
                        placeholder="Mật khẩu"
                        placeholderTextColor='#9CA3AF'
                        value={form.password}
                        onChangeText={(text) => setForm({ ...form, password: text })}
                        secureTextEntry
                        rounded={12}
                        height={50}
                    />
                </View>
                <View className={registerClassStyle.input}>
                    <Input
                        placeholder="Xác nhận mật khẩu"
                        placeholderTextColor="#9CA3AF"
                        value={form.confirmPassword}
                        onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
                        secureTextEntry
                        rounded={12}
                        height={50}
                    />
                </View>
                <TouchableOpacity
                    className={`rounded-xl items-center my-6`}
                    style={RegisterStyle.btnSignUp}
                    onPress={handleSignUp}
                >
                    <Text style={RegisterStyle.textSignUp}>
                        Đăng ký
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`rounded-xl items-center`}
                    onPress={handleAlreadyHaveAccount}
                >
                    <Text style={RegisterStyle.textAlreadyHaveAccount}>
                        Đã có tài khoản? Đăng nhập
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default RegisterScreen;
