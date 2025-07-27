import { selectUser } from '@app/features';
import { store } from '@app/store';
import React from 'react';
import { View, Text } from 'react-native';

const HomeScreen = () => {
  const user =selectUser(store.getState());
  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text className="text-2xl font-bold text-blue-600 mb-4">Màn hình Home</Text>
      <Text className="text-lg text-gray-700 mb-8">Chào mừng {user?.fullname} đến với App chat</Text>
      <View className="bg-white p-6 rounded-lg shadow-lg">
        <Text className="text-xl font-bold text-green-500 text-center">
          Welcome to NativeWind!
        </Text>
      </View>
    </View>
  );
};

export default HomeScreen;
