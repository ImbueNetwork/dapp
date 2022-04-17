"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const google_oidc_1 = require("./strategies/google-oidc");
const polkadot_js_1 = require("./strategies/web3/polkadot-js");
const db_1 = __importDefault(require("../../db"));
passport_1.default.use(google_oidc_1.googleOIDCStrategy);
passport_1.default.use(polkadot_js_1.polkadotJsStrategy);
passport_1.default.serializeUser((user, done) => {
    if (!user.id) {
        return done(new Error("Failed to serialize User: no `id` found."));
    }
    return done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await db_1.default.select().from("users").where({ "id": Number(id) }).first();
        if (!user) {
            done(new Error(`No user found with id: ${id}`));
        }
        else {
            user.web3Accounts = await (0, db_1.default)("web3_accounts").select().where({
                user_id: user.id
            });
            return done(null, user);
        }
    }
    catch (e) {
        return done(new Error(`Failed to deserialize user with id ${id}`, { cause: e }));
    }
});
const router = express_1.default.Router();
router.use("/auth/web3/polkadot-js", polkadot_js_1.polkadotJsAuthRouter);
router.use("/auth/oauth2/accounts.google.com", google_oidc_1.googleOIDCRouter);
router.get("/auth", (req, res, _next) => {
    return res.status(req.isAuthenticated()
        ? 200
        : 401).end();
});
router.get("/logout", (req, res, next) => {
    const redirect = req.query.n;
    req.logout();
    res.redirect(redirect
        ? redirect
        : "/");
});
exports.default = router;
