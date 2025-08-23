import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import App from "./App";

if (__DEV__) {
  require("./ReactotronConfig");
}

registerRootComponent(App);
