const path = require("path");
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer');
// webpackConfig.plugins = [
//   new WebpackBundleAnalyzer.BundleAnalyzerPlugin(),
// ]

module.exports = {
    entry: {
        "grant-submission": "./src/grant-submission.ts",
        "material-components": "./src/material-components.ts",
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                use: {
                    loader: "html-loader",
                    options: {
                        esModule: true
                    }
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: "css-loader",
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".js", ".html"],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    // plugins: [new WebpackBundleAnalyzer.BundleAnalyzerPlugin()]
};
