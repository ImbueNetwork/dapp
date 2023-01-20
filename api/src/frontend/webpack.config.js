const path = require("path");

module.exports = {
    entry: {
        "login": path.resolve(__dirname, "login.tsx"),
        "proposals": path.resolve(__dirname, "proposals.tsx"),
        "details": path.resolve(__dirname, "details.tsx"),
        "new-brief": path.resolve(__dirname, "new-brief.tsx"),
        "join": path.resolve(__dirname, "join.tsx"),
        "googlelogin": path.resolve(__dirname, "googlelogin.tsx")
    },
    devtool: process.env.NODE_ENV === "development"
        ? "inline-source-map"
        : void 0,
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    configFile: path.resolve(__dirname, "tsconfig.json")
                }
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
                use: [
                  'style-loader',
                  'css-loader',
                ]
            },
        ]
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"],
        alias: {
            lib: path.resolve(__dirname, "lib"),
        },
        fallback: {
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "buffer": false,
           },
    },
    output: {
        path: path.resolve(__dirname, "../../public/lib"),
    },
    watchOptions: {
        poll: true
    }
};
