import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabNavigatorScreenType } from '../types/navigator';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabNavigatorProps {
    screens: TabNavigatorScreenType[];
    navigatorOptions?: React.ComponentProps<ReturnType<typeof createBottomTabNavigator>['Navigator']>;
}

const TabNavigator = ({ screens, navigatorOptions }: TabNavigatorProps) => {
    const Tab = createBottomTabNavigator();
    const insets = useSafeAreaInsets();

    // Merge với default options để tối ưu cho ứng dụng chat
    const defaultOptions = {
        screenOptions: {
            headerShown: false,
            tabBarActiveTintColor: '#007aff',
            tabBarInactiveTintColor: '#8e8e93',
            tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '500' as const
            },
            tabBarStyle: {
                height: 60 + insets.bottom,
                paddingBottom: insets.bottom,
                paddingTop: 8,
                backgroundColor: '#ffffff',
                borderTopWidth: 1,
                borderTopColor: '#e0e0e0',
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: -2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 5,
            },
        },
        ...navigatorOptions,
    };

    return (
        <Tab.Navigator {...defaultOptions}>
            {screens.map((route, index) => (
                <Tab.Screen
                    key={`${route.name}-${index}`}
                    name={route.name}
                    component={route.component}
                    options={route.options}
                />
            ))}
        </Tab.Navigator>
    );
};

export default TabNavigator;
