import { BottomTabNavigationOptions, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StackNavigationOptions, StackNavigatorProps } from "@react-navigation/stack";

export interface TabNavigatorScreenType {
    name: string;
    component: () => React.JSX.Element;
    options?: BottomTabNavigationOptions;
}

export interface TabNavigatorType {
    screens: TabNavigatorScreenType[];
    navigatorOptions?: React.ComponentProps<ReturnType<typeof createBottomTabNavigator>['Navigator']>;
}

export interface StackNavigatorType {
    name: string;
    component: () => React.JSX.Element | TabNavigatorType;
    options?: StackNavigationOptions;
}

export interface RouterType {
    navigatorOptions: StackNavigatorProps;
    screens: StackNavigatorType[];
}