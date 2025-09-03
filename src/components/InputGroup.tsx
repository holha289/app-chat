import { InputGroupClassStyle } from "@app/styles/input.style";
import React from "react";
import { View, TextInput, Text, StyleSheet, Image, TextInputProps } from "react-native";

interface InputGroupProps extends TextInputProps {
  prefix?: React.ReactNode; // icon hoặc text đầu
  suffix?: React.ReactNode; // icon hoặc text cuối
  rounded?: number;
  height?: number;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({
  prefix,
  suffix,
  rounded = 8,
  height = 48,
  iconLeft,
  iconRight,
  ...props
}) => {
  return (
    <View
      className={InputGroupClassStyle.container}
      style={[{ borderRadius: rounded, height: height }]}
    >
      {prefix && (
        <View className={InputGroupClassStyle.prefixContainer}>
          {typeof prefix === "string" ? (
            <Text className={InputGroupClassStyle.prefixText}>{prefix}</Text>
          ) : (
            prefix
          )}
        </View>
      )}
      {iconLeft && (
        <View className={InputGroupClassStyle.iconContainer}>
          {iconLeft}
        </View>
      )}
      <TextInput
        className={InputGroupClassStyle.input}
        style={{ flex: 1, height: height }}
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
      {iconRight && (
        <View className={InputGroupClassStyle.iconContainer}>
          {iconRight}
        </View>
      )}
    </View>
  );
};

export default InputGroup;
