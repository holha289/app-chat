import { StackNavigatorProps } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import { RouterType } from "../types/navigator";
import SplashScreen from "@app/screens/SplashScreen";
import LoginScreen from "@app/screens/pages/LoginScreen";
import RegisterScreen from "@app/screens/pages/RegisterScreen";
import StartScreen from "@app/screens/StartScreen";


const routers: RouterType = {
    navigatorOptions: {
        initialRouteName: 'Register',
    } as StackNavigatorProps,
    screens: [
        {
            name: 'Home',
            component: HomeScreen,
            options: { headerShown: false },
        },
        {
            name: 'Login',
            component: LoginScreen,
            options: { headerShown: false },
        },
        {
            name: 'Register',
            component: RegisterScreen,
            options: { headerShown: false },
        },
        {
            name: 'Splash',
            component: SplashScreen,
            options: { headerShown: false },
        },
        {
            name: 'Start',
            component: StartScreen, 
            options: { headerShown: false },
        },
    ],
};

export default routers;
