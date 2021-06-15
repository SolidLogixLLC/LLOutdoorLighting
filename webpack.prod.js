const path = require("path");
const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const ImageminPlugin = require("imagemin-webpack-plugin").default;
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const config = require("./webpack.config");

module.exports = merge(config, {
  mode: "production",
  devtool: "source-map",
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "./docs"),
  },
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "./src/assets", to: "./assets" }],
    }),
    // new ImageminPlugin({
    //   pngquant: { quality: "65-90" },
    //   plugins: [imageminMozjpeg({ quality: 50 })],
    // }),
  ],
});
