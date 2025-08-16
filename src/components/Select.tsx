import SelectStyle from "@app/styles/select.style";
import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

type SelectProps = {
  label?: string;
  options: string[];
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  style?: any;
};

export const Select: React.FC<SelectProps> = ({
  label = "",
  options,
  value,
  placeholder = "Select an option",
  onChange,
  style,
}) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <View style={[SelectStyle.container, style]}>
      {label ? <Text style={SelectStyle.label}>{label}</Text> : null}
      <TouchableOpacity
        style={SelectStyle.selectBox}
        onPress={() => setVisible(!visible)}
        activeOpacity={0.7}
      >
        <Text style={[SelectStyle.selectedText, !value && SelectStyle.placeholder]}>
          {value || placeholder}
        </Text>
        <FontAwesome 
          name={visible ? "chevron-up" : "chevron-down"} 
          size={18} 
          color="#888" 
        />
      </TouchableOpacity>
      
      {visible && (
        <View style={SelectStyle.dropdown}>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[SelectStyle.option, value === item && SelectStyle.selectedOption]}
                onPress={() => {
                  onChange(item);
                  setVisible(false);
                }}
              >
                <Text style={[SelectStyle.optionText, value === item && SelectStyle.selectedOptionText]}>
                  {item}
                </Text>
                {value === item && (
                  <FontAwesome name="check" size={16} color="#007AFF" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};