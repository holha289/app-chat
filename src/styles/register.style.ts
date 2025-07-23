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
    },
    btnContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignSelf: 'stretch',
        paddingTop: 24,
    }
});

const registerClassStyle = {
    container: 'flex-1 px-8 pt-20 pb-8 bg-white',
    header: 'items-center mb-8',
    title: clsx(classFontSize['3xl'], classText.primary, 'font-bold', 'mb-4'),
    subtitle: clsx('text-center', classFontSize['base'], 'text-gray-600', 'leading-6'),
    inputContainer: 'mt-4 mb-8',
    input: 'mb-4',
    stepContainer: 'mt-3 w-full flex-col',
    stepTitle: clsx(classFontSize['xl'], classText.primary, 'font-bold', 'mb-2'),
};

export { RegisterStyle, registerClassStyle };