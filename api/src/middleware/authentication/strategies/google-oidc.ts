import express from "express";
import passport from "passport";
import { verifyOIDC } from "../common";
import config from "../../../config";

// No @types yet :(
const OIDCStrategy = require("passport-openidconnect");


export class GoogleOIDCStrategy extends OIDCStrategy {
    name: string;

    constructor(options: Record<string,any>, verify: CallableFunction) {
        super({
            ...config.oidc.google,
            ...options
        }, verify);
        this.name = "google";
    }

    authenticate(req: Express.Request, opts?: Record<string,any>) {
        super.authenticate(req, opts);
    }
}


export const googleOIDCStrategy = new GoogleOIDCStrategy(
    {
        // callbackURL: "/oauth2/redirect/accounts.google.com",
        scope: ["profile"],
        // state: true,
    },
    (issuer: string, profile: Record<string,any>, done: CallableFunction) => {
        return verifyOIDC(issuer, profile.id, profile.displayName, done);
    }
);

export const googleOIDCRouter = express.Router();

googleOIDCRouter.get("/login", passport.authenticate("google"));
googleOIDCRouter.get("/redirect", passport.authenticate(
    "google",
    {
        successReturnToOrRedirect: "/",
        failureRedirect: "/error"
    }
));
