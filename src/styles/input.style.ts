import { StyleSheet } from 'react-native';
import { colors } from './main.style';

const inputStyles = StyleSheet.create({
    container: {
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

const InputOtpStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginVertical: 16,
  },
  input: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    fontSize: 24,
    backgroundColor: "#fff",
  },
  inputActive: {
    borderColor: colors.color1,
  },
});

const InputGroupClassStyle = {
    container: 'flex-1 flex-row items-center border border-gray-300 bg-white rounded-lg px-3',
    label: 'text-base font-medium mb-2',
    inputContainer: 'relative',
    input: 'rounded-lg p-3 text-base',
    prefixContainer: 'flex items-center mr-2',
    prefixText: 'text-gray-700',
    suffixContainer: 'flex items-center ml-2',
    suffixText: 'text-gray-700',
}

export { inputStyles, InputOtpStyles, InputGroupClassStyle };