import { StyleSheet } from "react-native";
import { classFontSize, classText, colors } from "./main.style";
import { clsx } from "clsx";


const ProfileStyle = StyleSheet.create({
    btn: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0ecec',
        paddingVertical: 12,
        height: 50,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    uploadBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.color2,
        borderRadius: 20,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    }
});

const ProfileClassStyle = {
    container: 'flex-1 items-center bg-[#f9f9f9] px-4',
    avatar: 'w-32 h-32 rounded-full object-cover mt-10',
    title: clsx(classFontSize['2xl'], classText.primary, 'font-bold', 'my-4'), 
    actionBtn1: 'mt-6 w-full space-y-3 bg-white py-6 rounded-2xl shadow-lg',
    containerEdit: 'flex-1 items-center px-4 bg-white',
    actionBtn1Edit: 'mt-6 w-full',
};

export { ProfileStyle, ProfileClassStyle };