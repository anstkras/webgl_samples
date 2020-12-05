const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(obj|glsl|vert|frag)$/,
        exclude: /node_modules/,
        use: {
          loader: 'raw-loader'
        }
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader'
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(mtl)$/i,
        use: [
          {
            loader: 'raw-loader',
          },
        ],
      }
    ]
  },
  devtool: 'eval-source-map',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "./src/resources", to: "resources" },
        // { from: "other", to: "public" },
      ],}),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
      favicon: './src/favicon.ico'
    }),
  ],
};
