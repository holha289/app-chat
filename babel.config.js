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
<<<<<<< HEAD
        blocklist: null,
        allowlist: null,
=======
>>>>>>> 81791df475c46f2c7193c1b2b167b2d78d470f73
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};
