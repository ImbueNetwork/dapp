"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOIDCRouter = exports.googleOIDCStrategy = exports.GoogleOIDCStrategy = void 0;
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const models_1 = require("../../../models");
const config_1 = __importDefault(require("../../../config"));
// No @types yet :(
const OIDCStrategy = require("passport-openidconnect");
/**
 * When developing locally, not having a `clientID` and `clientSecret` will
 * prevent the server from starting, so instead of allowing that to happen, we
 * just spoof these values which effectively disables google OIDC locally.
 */
const hasGoogleCreds = Object.entries(config_1.default.oidc.google).every(([_, v]) => v);
const googleClientCredentials = hasGoogleCreds
    ? config_1.default.oidc.google
    : {
        clientID: "garbage",
        clientSecret: "garbage",
    };
class GoogleOIDCStrategy extends OIDCStrategy {
    name;
    constructor(options, verify) {
        super({
            ...config_1.default.oidc.google,
            // i.e., this will override the `clientID` and `clientSecret` from
            // `config.oicd.google`, but preserve the other entries it had (see
            // comment above for declaration of `googleClientCredentials`):
            ...googleClientCredentials,
            ...options
        }, verify);
        this.name = "google";
    }
    authenticate(req, opts) {
        super.authenticate(req, opts);
    }
}
exports.GoogleOIDCStrategy = GoogleOIDCStrategy;
exports.googleOIDCStrategy = new GoogleOIDCStrategy({
    // callbackURL: "/oauth2/redirect/accounts.google.com",
    scope: ["profile"],
    // state: true,
}, (issuer, profile, done) => {
    return (0, models_1.getOrCreateFederatedUser)(issuer, profile.id, profile.displayName, done);
});
exports.googleOIDCRouter = express_1.default.Router();
exports.googleOIDCRouter.get("/login", (req, _res, next) => {
    if (req.query.n) {
        req.session.next = req.query.n;
    }
    next();
}, passport_1.default.authenticate("google"));
exports.googleOIDCRouter.get("/redirect", passport_1.default.authenticate("google", {
    successReturnToOrRedirect: "/redirect",
    // We don't have any error page yet
    failureRedirect: "/"
}));
