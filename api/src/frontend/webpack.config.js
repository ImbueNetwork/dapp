const path = require("path");

module.exports = {
    entry: {
        "login": path.resolve(__dirname, "login.tsx")
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
                use: "css-loader",
            },
        ]
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"],
        alias: {
            lib: path.resolve(__dirname, "lib"),
        },
    },
    output: {
        path: path.resolve(__dirname, "../../public/lib"),
    },
    watchOptions: {
        poll: true
    }
};
