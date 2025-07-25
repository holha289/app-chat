import { InputOtpStyles } from "@app/styles/input.style";
import React, { useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";

interface InputOtpProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

const InputOtp: React.FC<InputOtpProps> = ({
  length = 4,
  value,
  onChange,
}) => {
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, idx: number) => {
    let newValue = value.split("");
    newValue[idx] = text;
    const joined = newValue.join("").slice(0, length);
    onChange(joined);

    if (text && idx < length - 1) {
      inputs.current[idx + 1]?.focus();
    } else if (text === "" && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (value[idx]) {
        let newValue = value.split("");
        newValue[idx] = "";
        onChange(newValue.join(""));
      } else if (idx > 0) {
        inputs.current[idx - 1]?.focus();
        let newValue = value.split("");
        newValue[idx - 1] = "";
        onChange(newValue.join(""));
      }
    }
  };

  return (
    <View style={InputOtpStyles.container}>
      {Array.from({ length }).map((_, idx) => (
        <TextInput
          key={idx}
          ref={ref => { inputs.current[idx] = ref; }}
          style={[
            InputOtpStyles.input,
            value[idx] ? InputOtpStyles.inputActive : null,
          ]}
          keyboardType="number-pad"
          maxLength={1}
          value={value[idx] || ""}
          onChangeText={text => handleChange(text, idx)}
          onKeyPress={e => handleKeyPress(e, idx)}
          textAlign="center"
        />
      ))}
    </View>
  );
};

export default InputOtp;