const path = require('path');
const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(tsx|ts)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(jsx|js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        include: [/[\\/]node_modules[\\/].*antd/, /App\.css/],
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader', options: {
            modules: false,
          }},
        ],
      },
      {
        test: /\.css$/,
        exclude: [/[\\/]node_modules[\\/].*antd/, /App\.css/],
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader', options: {
            modules: true,
          }},
        ],
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        type: 'asset',
        generator: {
          filename: 'static/[hash][ext][query]',
        },
      },
    ],
  },
  devServer: {
    port: 8080,
    proxy: {
      '/api': 'http://localhost:3000',
    },
    client: {
      progress: true,
    },
    static: path.resolve(__dirname, '..', 'dist'), // 根目录
    open: false, // 自动打开浏览器
    compress: true, // 启动 gzip 压缩
    hot: true,
  },
});
