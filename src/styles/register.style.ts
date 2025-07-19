import { StyleSheet } from "react-native";
import { classFontSize, classText, colors } from "./main.style";
import clsx from 'clsx';

const RegisterStyle = StyleSheet.create({
    textSignUp: {
        color: colors.white,
        fontWeight: '600',
    },
    textAlreadyHaveAccount: {
        color: colors.black,
        fontWeight: '500',
    }
});

const registerClassStyle = {
    container: 'flex-1 px-8 pt-20 pb-8',
    header: 'items-center mb-8',
    title: clsx(classFontSize['3xl'], classText.primary, 'font-bold', 'mb-4'),
    subtitle: clsx('text-center', classFontSize['base'], 'text-gray-600', 'leading-6'),
    inputContainer: 'mt-12 mb-8',
    input: 'mb-4',
};

export { RegisterStyle, registerClassStyle };