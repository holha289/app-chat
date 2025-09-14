import { Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { registerClassStyle, RegisterStyle } from "@app/styles/register.style";
import Input from "@app/components/Input";
import { classBtn } from "@app/styles/main.style";
import clsx from "clsx";
import InputOtp from "@app/components/InputOtp";
import InputGroup from "@app/components/InputGroup";
import { PhoneAuthProvider, signInWithCredential, signInWithPhoneNumber } from "@react-native-firebase/auth";
import { getAuth } from "@app/core/firebase";
import { formatPhoneNumber, isValidPhoneNumber } from "@app/core/util";
import { useDispatch } from "react-redux";
import authActions from "@app/features/auth/auth.action";
import { Select } from "@app/components/Select";
import { LoadingOverlay } from "@app/components";

const RegisterScreen = () => {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        otp: "",
        gender: ""
    });
    const [step, setStep] = useState(3); // Bước hiện tại, bắt đầu từ bước 1    
    const navigation = useNavigation();
    const recaptchaVerifier = useRef(null);
    const [verificationId, setVerificationId] = useState('');
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleNextStep = () => {
        if (step === 2 && !form.otp) {
            alert("Vui lòng nhập mã OTP");
            return;
        }
        if (step === 1 && !form.phone) {
            alert("Vui lòng nhập số điện thoại");
            return;
        }
        if (step === 3) {
            if (!form.name) { alert("Vui lòng nhập họ và tên"); }
            else if (!form.password) { alert("Vui lòng nhập mật khẩu"); }
            else if (!form.confirmPassword) { alert("Vui lòng xác nhận mật khẩu"); }
            else if (form.password !== form.confirmPassword) { alert("Mật khẩu xác nhận không khớp"); }
            else { handleSignUp(); }
            return;
        }
        if (step === 1) {
            const isValid = handleOtpChange();
            if (!isValid) return;
        } else if (step === 2) {
            confirmCode();
            return
        }
        setStep(step + 1);
    };

    const handleSignUp = () => {
        setLoading(true);
        dispatch(authActions.register({
            fullname: form.name,
            username: form.phone,
            password: form.password,
            gender: form.gender,
            callback: (error) => {
                setLoading(false);
                if (error) {
                    alert("Đăng ký không thành công");
                    return;
                }
                navigation.goBack();
            }
        }));
    };

    const handleAlreadyHaveAccount = () => {
        navigation.goBack();
    };

    const handleOtpChange = async () => {
        if (!form.phone) {
            alert("Vui lòng nhập số điện thoại");
            return false;
        }
        if (!isValidPhoneNumber(form.phone)) {
            alert("Số điện thoại không hợp lệ");
            return false;
        }

        try {
            const auth = getAuth();
            const confirmation = await signInWithPhoneNumber(auth, formatPhoneNumber(form.phone));
            setVerificationId(confirmation.verificationId ?? '');
            // Bạn cũng có thể lưu `confirmation` vào state nếu cần `confirm(code)` sau này
        } catch (error) {
            console.error("Lỗi gửi OTP:", error);
            alert("Không thể gửi mã OTP, vui lòng thử lại sau.\n" + JSON.stringify(error));
        }
        return true;
    }

    async function confirmCode() {
        if (!verificationId || !form.otp) {
            alert("Vui lòng nhập mã OTP");
            return;
        }
        try {
            const credential = PhoneAuthProvider.credential(verificationId, form.otp);
            const auth = getAuth();
            await signInWithCredential(auth, credential);
            console.log("Xác thực thành công");
            setStep(3); // Chuyển sang bước 3
        } catch (error) {
            console.error("Lỗi xác thực mã OTP:", error);
            alert("Mã OTP không hợp lệ, vui lòng thử lại.");
        }
    }

    return (
        <ScrollView className="w-full flex-1" keyboardShouldPersistTaps="handled" >
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className={registerClassStyle.container}>
                <LoadingOverlay visible={loading} />
                <View className={registerClassStyle.header}>
                    <Text className={registerClassStyle.title}>
                        Đăng ký tài khoản
                    </Text>
                    <Text className={registerClassStyle.subtitle}>
                        Tạo một tài khoản để bạn có thể khám phá tất cả các công việc hiện có
                    </Text>
                </View>

                {/* <View className={registerClassStyle.stepContainer}>
                <Text className={registerClassStyle.stepTitle}>
                    {step === 1 ? "Bước 1: Nhập số điện thoại" : step === 2 ? "Bước 2: Nhập mã OTP" : "Bước 3: Nhập thông tin cá nhân"}
                </Text>
            </View> */}

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
                                length={6}
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
                            <View className={registerClassStyle.input}>
                                <Select
                                    options={[
                                        { label: "Nam", value: "male" },
                                        { label: "Nữ", value: "female" },
                                        { label: "Khác", value: "other" }
                                    ]}
                                    placeholder="Giới tính"
                                    value={form.gender}
                                    onChange={(value) => setForm({ ...form, gender: value })}
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
                                {step === 1 ? "Tiếp tục" : step === 2 ? "Xác nhận OTP" : "Đăng ký"}
                            </Text>
                        </TouchableOpacity>
                        {step === 1 || step === 3 && (
                            <TouchableOpacity
                                className={classBtn.none}
                                onPress={handleAlreadyHaveAccount}
                            >
                                <Text style={RegisterStyle.textAlreadyHaveAccount}>
                                    Đã có tài khoản? Đăng nhập ngay
                                </Text>
                            </TouchableOpacity>
                        )}
                        {step === 2 && (
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
            </KeyboardAvoidingView>
        </ScrollView>
    );
};

export default RegisterScreen;
