

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InputGroup from '../InputGroup';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../Input';

interface CustomHeaderProps {
    navigation: {
        goBack: () => void;
    };
    onchange: (value: string) => void;
}

const HeaderSearch = ({ navigation, onchange }: CustomHeaderProps) => {
    return (
        <SafeAreaView>
            <View
                style={{
                    height: 60,
                    backgroundColor: "#fff",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 12,
                }}
            >
                {/* Back button */}
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>

                {/* Search box */}
                <View className="flex-1 ml-4">
                    <View className="flex-row items-center py-2">
                        <Input
                            // iconLeft={<Ionicons name="search" size={20} color="gray" />}
                            placeholder="Tìm kiếm"
                            rounded={20}
                            height={40}
                            onChangeText={onchange}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

export default HeaderSearch;
