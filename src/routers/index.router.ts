import { StackNavigatorProps } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import { RouterType } from "../types/navigator";


const routers: RouterType = {
    navigatorOptions: {
        initialRouteName: 'Home',
    } as StackNavigatorProps,
    screens: [
        {
            name: 'Home',
            component: HomeScreen,
            options: { headerShown: false },
        },
    ],
};

export default routers;
