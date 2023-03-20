const path = require("path");
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: {
        "login": path.resolve(__dirname, "login.tsx"),
        "proposals": path.resolve(__dirname, "proposals.tsx"),
        "details": path.resolve(__dirname, "details.tsx"),
        "briefs": path.resolve(__dirname, "pages", "briefs", "index.tsx"),
        "new-brief": path.resolve(__dirname, "pages", "briefs", "new.tsx"),
        "brief-details": path.resolve(__dirname, "pages", "briefs", "details.tsx"),
        "brief-applications": path.resolve(__dirname, "pages", "briefs", "applications.tsx"),
        "new-freelancer": path.resolve(__dirname, "pages", "freelancer", "new.tsx"),
        "dashboard": path.resolve(__dirname, "pages", "dashboard", "index.tsx"),
        "freelancer-profile": path.resolve(__dirname, "pages", "freelancer", "profile.tsx"),
        "new-project": path.resolve(__dirname, "pages", "projects", "new.tsx"),
        "freelancers": path.resolve(__dirname, "pages", "freelancer", "index.tsx"),
        "googlelogin": path.resolve(__dirname, "googlelogin.tsx"),
        "join": path.resolve(__dirname, "join.tsx"),
        "submit-proposal": path.resolve(__dirname, "pages", "briefs", "submit.tsx"),
        "application-preview": path.resolve(__dirname, "pages", "briefs", "application-preview.tsx"),
        "hirer-dashboard": path.resolve(__dirname, "pages", "briefs", "hirer-dashboard.tsx"),
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
                use: ['style-loader', 'css-loader', 'postcss-loader'],
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
    },
    plugins: [
        new Dotenv()
      ]
};
