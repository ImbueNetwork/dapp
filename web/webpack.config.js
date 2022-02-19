const path = require("path");
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer');
// webpackConfig.plugins = [
//   new WebpackBundleAnalyzer.BundleAnalyzerPlugin(),
// ]

module.exports = {
    entry: {
        "material-components": "./src/material-components.ts",
        "dapp": "./src/dapp/index.ts",
    },
    devtool: process.env.NODE_ENV === "development"
        ? "inline-source-map"
        : void 0,
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(html|svg)$/,
                use: {
                    loader: "html-loader",
                    options: {
                        esModule: true
                    }
                },
                // exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: "css-loader",
            },
        ]
    },
    resolve: {
        extensions: [".js", ".ts"],
        alias: {
            lib: path.resolve(__dirname, "lib"),
        },
    },
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    // plugins: [new WebpackBundleAnalyzer.BundleAnalyzerPlugin()]
};
