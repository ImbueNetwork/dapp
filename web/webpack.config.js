const path = require("path");

module.exports = {
    entry: {
        "grant-submission": "./src/grant-submission.ts",
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
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js", ".html"],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
    },
};
