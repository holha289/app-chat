import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import routers from "../routers/index.router";
import TabNavigator from "./TabNavigator";
import { TabNavigatorType } from "../types/navigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { navigationRef } from "./RootNavigation";
const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          {...(routers.navigatorOptions as React.ComponentProps<
            typeof Stack.Navigator
          >)}
        >
          {routers.screens.map((screen, index) => {
            if (screen.name === "TabNavigator") {
              const tabNavigator =
                screen.component as unknown as TabNavigatorType;
              // return <TabNavigator {...tabNavigator} key={index} />;
              return (
                <Stack.Screen name="Main" key={index}>
                  {() => <TabNavigator {...tabNavigator} />}
                </Stack.Screen>
              );
            }
            const { component: Component, ...restProps } = screen;
            return (
              <Stack.Screen key={index} {...restProps}>
                {(props: React.JSX.IntrinsicAttributes) => {
                  if (typeof Component === "function") {
                    // @ts-ignore - Handling function components that may have varying prop requirements
                    return <Component {...props} />;
                  } else if (React.isValidElement(Component)) {
                    return Component;
                  }
                  return null;
                }}
              </Stack.Screen>
            );
          })}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
