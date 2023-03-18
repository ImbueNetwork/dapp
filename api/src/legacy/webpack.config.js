const path = require("path");

module.exports = {
  entry: {
    "material-components": path.resolve(__dirname, "material-components.ts"),
    dapp: path.resolve(__dirname, "dapp/index.ts"),
    "extend-webflow": path.resolve(__dirname, "extend-webflow/index.ts"),
  },
  devtool:
    process.env.NODE_ENV === "development" ? "inline-source-map" : void 0,
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          configFile: "./tsconfig.json",
        },
      },
      {
        test: /\.(html|svg)$/,
        use: {
          loader: "html-loader",
          options: {
            esModule: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: "css-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
    alias: {
      lib: path.resolve(__dirname, "lib"),
    },
  },
  output: {
    path: path.resolve(__dirname, "../../public/lib"),
  },
  watchOptions: {
    poll: true,
  },
  // plugins: [new WebpackBundleAnalyzer.BundleAnalyzerPlugin()]
};
