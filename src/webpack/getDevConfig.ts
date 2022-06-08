import webpack, { Configuration } from 'webpack';
import { SanitizedConfig } from '../config/types';
import getBaseConfig from './getBaseConfig';

export default (payloadConfig: SanitizedConfig): Configuration => {
  const baseConfig = getBaseConfig(payloadConfig) as any;

  let config: Configuration = {
    ...baseConfig,
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },
    entry: {
      ...baseConfig.entry,
      main: [
        require.resolve('webpack-hot-middleware/client'),
        ...(baseConfig.entry.main as string[]),
      ],
    },
    output: {
      publicPath: payloadConfig.routes.admin,
      path: '/',
      filename: '[name].js',
    },
    devtool: 'inline-source-map',
    mode: 'development',
    stats: 'errors-warnings',
    plugins: [
      ...baseConfig.plugins,
      new webpack.HotModuleReplacementPlugin(),
    ],
  };

  config.module.rules.push({
    test: /\.(scss|css)$/,
    sideEffects: true,
    use: [
      require.resolve('style-loader'),
      require.resolve('css-loader'),
      {
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            plugins: [require.resolve('postcss-preset-env')],
          },
        },
      },
      require.resolve('sass-loader'),
    ],
  });

  if (payloadConfig.admin.webpack && typeof payloadConfig.admin.webpack === 'function') {
    config = payloadConfig.admin.webpack(config);
  }

  return config;
};
