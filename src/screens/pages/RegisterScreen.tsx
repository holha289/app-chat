import { Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { registerClassStyle, RegisterStyle } from "@app/styles/register.style";
import Input from "@app/components/Input";
import { classBtn } from "@app/styles/main.style";
import clsx from "clsx";
import InputOtp from "@app/components/InputOtp";
import InputGroup from "@app/components/InputGroup";

const RegisterScreen = () => {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        otp: "",
    });
    const [step, setStep] = useState(1);
    const navigation = useNavigation();

    const handleNextStep = () => {
        if (step === 2 && !form.otp) {
            alert("Vui lòng nhập mã OTP");
            return;
        }
        if (step === 1 && !form.phone) {
            alert("Vui lòng nhập số điện thoại");
            return;
        }
        if (step === 3 && (!form.name || !form.email || !form.password || !form.confirmPassword)) {
            alert("Vui lòng điền đầy đủ thông tin cá nhân");
            return;
        }
        if (step === 3) {
            navigation.navigate("Home");
            return;
        }
        setStep(step + 1);
    };

    const handleSignUp = () => {
        navigation.navigate("Home");
    };

    const handleAlreadyHaveAccount = () => {
        navigation.goBack();
    };

    const handleOtpChange = () => {
    }

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

            <View className={registerClassStyle.stepContainer}>
                <Text className={registerClassStyle.stepTitle}>
                    {step === 1 ? "Bước 1: Nhập số điện thoại" : step === 2 ? "Bước 2: Nhập mã OTP" : "Bước 3: Nhập thông tin cá nhân"}
                </Text>
            </View>

            <View className={registerClassStyle.inputContainer}>
                {step === 1 && (
                    <View className={registerClassStyle.input}>
                        <InputGroup
                            prefix="+84"
                            placeholder="Số điện thoại"
                            placeholderTextColor='#9CA3AF'
                            value={form.phone}
                            onChangeText={(text) => setForm({ ...form, phone: text })}
                            keyboardType="number-pad"
                            rounded={12}
                            height={50}
                        />
                    </View>
                )}
                {step === 2 && (
                    <View className={registerClassStyle.input}>
                        <InputOtp
                            value={form.otp}
                            onChange={(otp) => setForm({ ...form, otp })}
                        />
                    </View>
                )}
                {step === 3 && (
                    <>
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
                    </>
                )}
                <View>
                    <TouchableOpacity
                            className={clsx(classBtn.primary, 'my-4')}
                            onPress={handleNextStep}
                        >
                            <Text style={RegisterStyle.textSignUp}>
                                {step === 1 ? "Tiếp tục" : step === 2 ? "Xác nhận OTP" : "Hoàn tất đăng ký"}
                            </Text>
                        </TouchableOpacity>
                        { step === 1 && (
                            <TouchableOpacity
                                className={classBtn.none}
                                onPress={handleAlreadyHaveAccount}
                            >
                                <Text style={RegisterStyle.textAlreadyHaveAccount}>
                                    Đã có tài khoản? Đăng nhập ngay
                                </Text>
                            </TouchableOpacity>
                        )}
                        { step === 2 && (
                            <TouchableOpacity
                                className={classBtn.outline}
                                onPress={handleOtpChange}
                            >
                                <Text style={RegisterStyle.textAlreadyHaveAccount}>
                                    Gửi lại mã OTP
                                </Text>
                            </TouchableOpacity>
                        )}
                </View>
            </View>
        </ScrollView>
    );
};

export default RegisterScreen;
