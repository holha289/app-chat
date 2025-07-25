import { InputGroupClassStyle } from "@app/styles/input.style";
import React from "react";
import { View, TextInput, Text, StyleSheet, Image, TextInputProps } from "react-native";

interface InputGroupProps extends TextInputProps {
  prefix?: React.ReactNode; // icon hoặc text đầu
  suffix?: React.ReactNode; // icon hoặc text cuối
  rounded?: number;
  height?: number;
}

const InputGroup: React.FC<InputGroupProps> = ({
  prefix,
  suffix,
  rounded = 8,
  height = 48,
  ...props
}) => {
  return (
    <View className={InputGroupClassStyle.container} style={[{ borderRadius: rounded, height }]}>
      {prefix && (
        <View className={InputGroupClassStyle.prefixContainer}>
          {typeof prefix === "string" ? (
            <Text className={InputGroupClassStyle.prefixText}>{prefix}</Text>
          ) : (
            prefix
          )}
        </View>
      )}
      <TextInput
        className={InputGroupClassStyle.input}
        style={[{ height, flex: 1 }]}
        {...props}
      />
      {suffix && (
        <View className={InputGroupClassStyle.suffixContainer}>
          {typeof suffix === "string" ? (
            <Text className={InputGroupClassStyle.suffixText}>{suffix}</Text>
          ) : (
            suffix
          )}
        </View>
      )}
    </View>
  );
};

export default InputGroup;
