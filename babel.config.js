module.exports = {
  presets: ['babel-preset-expo', 'nativewind/babel'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@app': './src',
          '@app/assets': './assets',
          '@app/screens': './src/screens',
          '@app/components': './src/components',
          '@app/styles': './src/styles',
          '@app/navigation': './src/navigation',
          '@app/routers': './src/routers',
          '@app/types': './src/types',
          '@app/store': './src/store',
          '@app/core': './src/core',
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    ],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
    [
      "react-native-reanimated/plugin",
      {
        relativeSourcePath: "src",
      },
    ],
  ],
};
