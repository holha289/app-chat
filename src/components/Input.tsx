import { useState } from "react";
import { inputStyles } from "@app/styles/input.style";
import { TextInput, View, Text, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
    label?: string;
    helperText?: string;
    floatingLabel?: boolean;
    rounded?: number;
    height?: number;
}

const Input = ({
    label = "",
    helperText = "",
    floatingLabel = false,
    rounded = 0,
    height = 46,
    ...props
}: InputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    
    const handleFocus = () => {
        setIsFocused(true);
    };
    
    const handleBlur = () => {
        setIsFocused(false);
    };

    return (
       <View style={inputStyles.container}>
           {label && !floatingLabel && (
               <Text style={inputStyles.label}>{label}</Text>
           )}
           <View style={inputStyles.inputContainer}>
               {floatingLabel && (
                   <Text style={[
                       inputStyles.floatingLabel,
                       (isFocused || hasValue) && inputStyles.floatingLabelActive
                   ]}>
                       {label}
                   </Text>
               )}
               <TextInput
                   style={[inputStyles.input, { borderRadius: rounded, height: height }]}
                   placeholder={floatingLabel ? "" : props.placeholder}
                   onFocus={handleFocus}
                   onBlur={handleBlur}
                   {...props}
               />
           </View>
           {helperText && (
               <Text style={inputStyles.helperText}>{helperText}</Text>
           )}
       </View>
    );
};

export default Input;
