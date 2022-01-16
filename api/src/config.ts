export default {
    environment: process.env.NODE_ENV || "development", // development, staging, or production
    port: 3000,
    session: {
        secret: "armavirumquecano",
        saveUninitialized: false,
        resave: false,
    }
};
