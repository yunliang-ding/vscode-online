const path = require("path")
const packageName = require('./package.json').name;
const os = require('os')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
function getIPAdress() {
  let localIPAddress = "";
  let interfaces = os.networkInterfaces();
  for (let devName in interfaces) {
    let iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      let alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        localIPAddress = alias.address;
      }
    }
  }
  return localIPAddress;
}
const config = {
  entry: './src/index.tsx',
  output: {
    path: process.env.NODE_ENV == "production" ? path.resolve(__dirname, '../workbench-build/frontend/public/') : path.resolve(__dirname, 'www/'),
    filename: 'app.js',
    library: `${packageName}-[name]`,
    libraryTarget: 'umd',
    jsonpFunction: `webpackJsonp_${packageName}`,
    publicPath: `http://49.233.85.54:${process.env.NODE_ENV == "production" ? 8001 : 9000}/`
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      component: path.join(__dirname, './src/component')
    }
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'react-router': 'ReactRouter'
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: [/node_modules/],
      use: {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: ['env', 'react'],
          plugins: [
            'transform-decorators-legacy',
            'add-module-exports',
            'transform-class-properties',
            'transform-object-rest-spread',
          ]
        }
      }
    }, {
      test: /\.(png|jpg|gif|svg|ttf|eot|woff|woff2)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'images/'
        }
      }
    }, {
      test: /\.(less|css)$/,
      use: [
        require.resolve('style-loader'),
        {
          loader: require.resolve('css-loader')
        },
        {
          loader: require.resolve('less-loader')
        }
      ],
    },
    {
      test: /\.(tsx|ts)?$/,
      exclude: [/node_modules/],
      use: ['ts-loader']
    }]
  },
  devServer: {
    host: getIPAdress(),
    port: 9000,
    hot: true,
    compress: true,
    contentBase: './www',
    proxy: [{
      context: ['/api'],
      target: `http://${getIPAdress()}:8090`,
      pathRewrite: { '^/api': '' },
      changeOrigin: true,
      secure: true
    }]
  },
  optimization: process.env.NODE_ENV === "production" ? {
    minimize: true
  } : {},
  performance: {
    hints: false
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['javascript', 'json', 'html', 'css', 'less', 'typescript']
    })
  ],
  mode: process.env.NODE_ENV == "development" ? "development" : "production"
}
module.exports = config