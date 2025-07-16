import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabNavigatorScreenType } from '../types/navigator';

interface TabNavigatorProps {
    screens: TabNavigatorScreenType[];
    navigatorOptions?: React.ComponentProps<ReturnType<typeof createBottomTabNavigator>['Navigator']>
}

const TabNavigator = ({ screens, navigatorOptions }: TabNavigatorProps) => {
    const Tab = createBottomTabNavigator();
    return (
        <Tab.Navigator {...navigatorOptions}>
            {screens.map((route, index) => (<Tab.Screen {...route} key={index} />))}
        </Tab.Navigator>
    );
};


export default TabNavigator;