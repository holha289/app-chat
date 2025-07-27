import React from "react";
import { RouterType } from "../types/navigator";

// Screens
import SplashScreen from "@app/screens/SplashScreen";
import StartScreen from "@app/screens/StartScreen";
import LoginScreen from "@app/screens/pages/LoginScreen";
import RegisterScreen from "@app/screens/pages/RegisterScreen";

// Tab Navigator (component)
import TabNavigator from "@app/navigation/TabNavigator";
import TabRoutes from "./tab.router";
import SearchScreen from "@app/screens/SearchScreen";
import ChatRoomScreen from "@app/screens/messages/ChatRoomScreen";

const routers: RouterType = {
  navigatorOptions: {
    initialRouteName: "Splash",
  },
  screens: [
    {
      name: "Splash",
      component: SplashScreen,
      options: { headerShown: false },
    },
    {
      name: "Start",
      component: StartScreen,
      options: { headerShown: false },
    },
    {
      name: "Login",
      component: LoginScreen,
      options: { headerShown: false },
    },
    {
      name: "Register",
      component: RegisterScreen,
      options: { headerShown: false },
    },
    {
        name:"Search",
        component: SearchScreen,
        options: { headerShown: false },
    },
    {
        name:"ChatRoom",
        component: ChatRoomScreen,
        options: { headerShown: false },
    },
    {
      name: "Main",
      component: () => 
        React.createElement(TabNavigator, {
          screens: TabRoutes.screens,
          navigatorOptions: TabRoutes.navigatorOptions
        }),
      options: { headerShown: false },
    },
  ],
};

export default routers;
