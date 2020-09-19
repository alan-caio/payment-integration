const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const path = require('path');
const getStyleLoaders = require('./getStyleLoaders');

const mockModulePath = path.resolve(__dirname, './mockModule.js');

module.exports = (config) => {
  let webpackConfig = {
    entry: {
      main: [path.resolve(__dirname, '../client/components/index.js')],
    },
    output: {
      path: path.resolve(process.cwd(), 'build'),
      publicPath: `${config.routes.admin}/`,
      filename: '[name].[chunkhash].js',
      chunkFilename: '[name].[chunkhash].js',
    },
    mode: 'production',
    resolveLoader: { modules: ['node_modules', path.join(__dirname, '../../node_modules')] },
    module: {
      rules: [
        {
          test: require.resolve('../client/components/customComponents'),
          use: [
            {
              loader: 'val-loader',
              options: config,
            },
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules\/(?!(@payloadcms\/payload)\/).*/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  require.resolve('@babel/preset-env'),
                  {
                    targets: [
                      'defaults',
                      'not IE 11',
                      'not IE_Mob 11',
                    ],
                  },
                ],
                require.resolve('@babel/preset-react'),
              ],
              plugins: [
                require.resolve('@babel/plugin-proposal-optional-chaining'),
                require.resolve('@babel/plugin-proposal-class-properties'),
              ],
            },
          },
        },
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // Opt-in support for SASS (using .scss or .sass extensions).
            // Chains the sass-loader with the css-loader and the style-loader
            // to immediately apply all styles to the DOM.
            {
              test: /\.(scss|sass|css)$/,
              use: getStyleLoaders({ importLoaders: 2 }, 'sass-loader'),
            },
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
              loader: require.resolve('file-loader'),
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
          ],
        },
      ],
    },
    resolve: {
      modules: ['node_modules', path.resolve(__dirname, '../../node_modules')],
      alias: {
        'payload/unsanitizedConfig': config.paths.config,
        'payload/config': path.resolve(__dirname, '../client/config.js'),
        '@payloadcms/payload$': mockModulePath,
      },
    },
    plugins: [
      // new BundleAnalyzerPlugin(),
      new HtmlWebpackPlugin({
        template: config.admin && config.admin.indexHTML
          ? path.join(config.paths.configDir, config.admin.indexHTML)
          : path.resolve(__dirname, '../client/index.html'),
        filename: './index.html',
        minify: true,
      }),
      new Dotenv({
        silent: true,
        systemvars: true,
      }),
    ],
  };

  if (Array.isArray(config.serverModules)) {
    config.serverModules.forEach((module) => {
      webpackConfig.resolve.alias[module] = mockModulePath;
    });
  }

  if (config.paths.scss) {
    webpackConfig.resolve.alias['payload-scss-overrides'] = path.join(config.paths.configDir, config.paths.scss);
  } else {
    webpackConfig.resolve.alias['payload-scss-overrides'] = path.resolve(__dirname, '../client/scss/overrides.scss');
  }

  if (config.webpack && typeof config.webpack === 'function') {
    webpackConfig = config.webpack(webpackConfig, 'production');
  }

  return webpackConfig;
};
