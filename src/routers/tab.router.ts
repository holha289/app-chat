import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '@app/screens/HomeScreen';
import ProfileScreen from '@app/screens/ProfileScreen';
import { TabNavigatorType } from '@app/types/navigator';

const TabRoutes: TabNavigatorType = {
  screens: [
    {
      name: 'Home',
      component: HomeScreen,
      options: {
        title: 'Home',
        tabBarIcon: ({ color, size }: { color: string; size: number }) => 
          React.createElement(Ionicons, { name: 'home-outline', size: size, color: color }),
      },
    },
    {
      name: 'Profile',
      component: ProfileScreen,
      options: {
        title: 'Profile',
        tabBarIcon: ({ color, size }: { color: string; size: number }) => 
          React.createElement(Ionicons, { name: 'person-outline', size: size, color: color }),
      },
    },
  ],
  navigatorOptions: {
    screenOptions: {
      headerShown: false,
      tabBarActiveTintColor: '#007aff',
      tabBarInactiveTintColor: '#ccc',
      tabBarLabelStyle: {
        fontSize: 12,
      },
      tabBarStyle: {
        height: 60,
        paddingBottom: 5,
      },
    },
    initialRouteName: 'Home',
  },
};

export default TabRoutes;
