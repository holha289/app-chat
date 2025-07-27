import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '@app/screens/HomeScreen';
import ProfileScreen from '@app/screens/ProfileScreen';
import { TabNavigatorType } from '@app/types/navigator';
import ContactScreen from '@app/screens/ContactScreen';
import ChatListScreen from '@app/screens/messages/ChatListScreen';

const TabRoutes: TabNavigatorType = {
  screens: [
    {
      name: 'Chats',
      component: ChatListScreen,
      options: {
        title: 'Tin nhắn',
        tabBarIcon: ({ color, size }: { color: string; size: number }) => 
          React.createElement(Ionicons, { name: 'chatbubble-outline', size: size, color: color }),
      },
    },
    {
      name: 'ContactScreen',
      component: ContactScreen,
      options: {
        title: 'Danh bạ',
        tabBarIcon: ({ color, size }: { color: string; size: number }) => 
          React.createElement(Ionicons, { name: 'bookmark-outline', size: size, color: color }),
      },
    },
  ],
  navigatorOptions: {
    initialRouteName: 'Chats',
  },
};

export default TabRoutes;
