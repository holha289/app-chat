import { StyleSheet } from "react-native";
import { classFontSize, colors } from "./main.style";

const RegisterStyle = StyleSheet.create({
    btnSignUp: {
        backgroundColor: colors.primary,
        height: 50,
        verticalAlign: 'middle',
        justifyContent: 'center',
    },
    textSignUp: {
        color: colors.white,
        fontWeight: '600',
    },
    alreadyHaveAccount: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.secondary,
        height: 50,
        verticalAlign: 'middle',
        justifyContent: 'center',
    },
    textAlreadyHaveAccount: {
        color: colors.black,
        fontWeight: '500',
    }
});
const registerClassStyle = {
    container: 'flex-1 px-8 pt-20 pb-8',
    header: 'items-center mb-8',
    title: 'text-3xl font-bold mb-4',
    subtitle: 'text-base text-gray-600 leading-6',
    inputContainer: 'mt-12 mb-8',
    input: 'mb-4',
    button: 'p-2 rounded-xl items-center mb-6',
};

export { RegisterStyle, registerClassStyle };