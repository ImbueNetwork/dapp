export default {
    environment: process.env.NODE_ENV || "development", // development, staging, or production
    port: process.env.PORT || 3000,
    session: {
        secret: "armavirumquecano",
        saveUninitialized: false,
        resave: false,
    },
    oidc: {
        google: {
            clientID: process.env.GOOGLE_OAUTH2_CLIENT_ID,
            clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
            issuer: "https://accounts.google.com",
            authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth",
            tokenURL: "https://www.googleapis.com/oauth2/v4/token",
            callbackURL: `${process.env.WEB_HOST}/auth/oauth2/accounts.google.com/redirect`,
        }
    },
    imbueNetworkWebsockAddr: process.env.IMBUE_NETWORK_WEBSOCK_ADDR,
};
