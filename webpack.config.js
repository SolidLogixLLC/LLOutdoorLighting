const fs = require("fs");
const path = require("path");
const autoprefixer = require("autoprefixer");
const glob_entries = require("webpack-glob-folder-entries");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const TEMPLATE_DIRS = "./src/templates/pages";
const ARTICLES_DIR = "./src/templates/articles";
const LOCATIONS_DIR = './src/templates/locations';
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Get all path in directory including subdirectories
 *
 * @param   {string}  globPath  [Path to parent directory
 *
 * @return  {Array}            Array of path
 */
function returnEntries(globPath) {
  let entries = glob_entries(globPath, true);
  let folderList = new Array();
  for (let folder in entries) {
    folderList.push(path.join(__dirname, entries[folder]));
  }
  return folderList;
}

/**
 * Return an an array of HtmlWebpack plugins for each file under the `templateDir` directory
 *
 * @param   {string}  templateDir  The path to all the pages to be created
 *
 * @param {string}    nestedFolder Name of an extra folder if it's needed
 *
 * @return  {Array}               Array of HtmlWebpack plugin
 */
function generateHtmlPlugins(templateDir, nestedFolder) {
  // Read files in template directory
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map((item) => {
    // Split names and extension
    const [name, extension] = item.split('.');
    // Create new HTMLWebpackPlugin with options

    const pathToFile = `${templateDir}/${name}.${extension}`;

    return new HtmlWebPackPlugin({
      filename: nestedFolder ? `${nestedFolder}/${name}.html` : `${name}.html`,
      template: `nunjucks-html-loader!${pathToFile}`,
    });
  });
}

// Call our function on our views directory.
const htmlPlugins = [
  ...generateHtmlPlugins(TEMPLATE_DIRS),
  ...generateHtmlPlugins(ARTICLES_DIR, 'articles'),
  ...generateHtmlPlugins(LOCATIONS_DIR, 'locations'),
];


module.exports = {
  entry: {
    app: "./src/js/app.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "./dist"),
  },
  devtool: isDevelopment && "eval-cheap-module-source-map",
  devServer: {
    port: 1147,
    open: true, // comment out this to prevent a browser tab to be opened
    allowedHosts: ["0.0.0.0"],
    contentBase: path.join(__dirname, "./src/"),
    overlay: true,
  },
  module: {
    rules: [
      {
        // HTML LOADER
        // Super important: We need to test for the html
        // as well as the nunjucks files
        test: /\.html$|njk|nunjucks/,
        use: [
          "html-loader",
          {
            loader: "nunjucks-html-loader",
            options: {
              // Other super important. This will be the base
              // directory in which webpack is going to find
              // the layout and any other file index.njk is calling.
              searchPaths: [...returnEntries("./src/templates/")],
              staticPaths: ["./src/"],
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { sourceMap: isDevelopment },
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: isDevelopment,
              postcssOptions: {
                plugins: [[autoprefixer, { browsers: ["last 2 versions"] }]],
              },
            },
          },
          {
            loader: "sass-loader",
            options: { sourceMap: isDevelopment },
          },
        ],
      },
      {
        // test: /\.(jpg|png|gif)$/,
        test: /\.(gif|png|jpe?g)$/i,
        use: [
          // "file-loader",
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "./dist/assets/img/",
              useRelativePath: true,
            },
          },
          {
            loader: "image-webpack-loader",
            options: {
              // mozjpeg: {
              //   progressive: true,
              //   // quality: 65,
              // },
              // optipng: {
              //   enabled: false,
              // },
              // pngquant: {
              //   // quality: "65-90",
              //   quality: [0.65, 0.9],
              //   speed: 4,
              // },
              // gifsicle: {
              //   interlaced: false,
              // },
              // webp: {
              //   quality: 75,
              // },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    ...htmlPlugins,
    new MiniCssExtractPlugin({
      filename: "[name]-styles.css",
      chunkFilename: "[id].css",
    }),
  ],
};
