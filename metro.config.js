// metro.config.js
const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Khai báo entry để tránh lỗi virtual-metro-entry
config.server = {
  ...config.server,
  enableVisualizer: false,
};

// Fix SVG
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg", "js", "jsx", "ts", "tsx", "json"],
};

// Xuất config
module.exports = withNativeWind(config, { input: "./global.css" });
