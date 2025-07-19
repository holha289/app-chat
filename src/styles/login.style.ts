import { StyleSheet } from "react-native";
import { classBtn, classFontSize, colors } from "./main.style";


const LoginStyle = StyleSheet.create({
    btnLogin: {
        backgroundColor: colors.primary,
        height: 50,
        verticalAlign: 'middle',
        justifyContent: 'center',
    },
    btnCreateAccount: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.secondary,
        height: 50,
        verticalAlign: 'middle',
        justifyContent: 'center',
    },
});

const loginClassStyle = {
    container: 'flex-1 px-8 pt-20 pb-8',
    header: 'items-center mb-8',
    title: `${classFontSize['3xl']} font-bold mb-4`,
    subtitle: `${classFontSize['base']} text-gray-600 leading-6`,
    inputContainer: 'mt-12 mb-8',
    input: 'mb-4',
    forgotPassword: 'items-end mb-6',
    button: 'p-2 rounded-xl items-center mb-6',
};

export { LoginStyle, loginClassStyle };