// Cập nhật file styles/input.style.js
import { StyleSheet } from 'react-native';

const inputStyles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
        color: '#000',
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        height: 46,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
        color: '#666',
    },
    floatingLabel: {
        position: 'absolute',
        left: 12,
        top: 13,
        fontSize: 16,
        color: '#999',
        backgroundColor: 'transparent',
        zIndex: 1,
    },
    floatingLabelActive: {
        top: -8,
        left: 8,
        fontSize: 12,
        color: '#000',
        backgroundColor: '#fff',
        paddingHorizontal: 4,
    }
});

export default inputStyles;