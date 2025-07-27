module.exports = {
    presets: ['babel-preset-expo', 'nativewind/babel'],
    plugins: [
    [
      'module-resolver',
      { // Cần thiết lập này để sử dụng alias khi sử dụng metro bundler
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
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};