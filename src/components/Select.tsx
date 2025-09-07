import SelectStyle from "@app/styles/select.style";
import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // ✅ Thay thế import

type OptionItem = {
  value: string;
  label: string;
};

type SelectProps = {
  label?: string;
  options: string[] | OptionItem[];
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

  // Helper function để normalize options
  const normalizeOptions = (opts: string[] | OptionItem[]): OptionItem[] => {
    return opts.map(opt => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  };

  // Helper function để lấy label hiển thị
  const getDisplayLabel = (val?: string): string => {
    if (!val) return placeholder;
    
    const normalizedOptions = normalizeOptions(options);
    const found = normalizedOptions.find(opt => opt.value === val);
    return found ? found.label : val;
  };

  const normalizedOptions = normalizeOptions(options);

  return (
    <View style={[SelectStyle.container, style]}>
      {label ? <Text style={SelectStyle.label}>{label}</Text> : null}
      <TouchableOpacity
        style={SelectStyle.selectBox}
        onPress={() => setVisible(!visible)}
        activeOpacity={0.7}
      >
        <Text style={[SelectStyle.selectedText, !value && SelectStyle.placeholder]}>
          {getDisplayLabel(value)}
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
            data={normalizedOptions}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[SelectStyle.option, value === item.value && SelectStyle.selectedOption]}
                onPress={() => {
                  onChange(item.value);
                  setVisible(false);
                }}
              >
                <Text style={[SelectStyle.optionText, value === item.value && SelectStyle.selectedOptionText]}>
                  {item.label}
                </Text>
                {value === item.value && (
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