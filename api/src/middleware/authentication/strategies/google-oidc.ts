import express from "express";
import passport from "passport";
import { verifyOIDC } from "../common";

// No @types yet :(
const OIDCStrategy = require("passport-openidconnect");


export class GoogleOIDCStrategy extends OIDCStrategy {
    name: string;

    constructor(options: Record<string,any>, verify: CallableFunction) {
        super({
            issuer: "https://accounts.google.com",
            authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth",
            tokenURL: "https://www.googleapis.com/oauth2/v4/token",
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
        clientID: process.env.GOOGLE_OAUTH2_CLIENT_ID,
        clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
        callbackURL: "/oauth2/redirect/accounts.google.com",
        scope: ["profile"],
        // state: true,
    },
    // verify
    (issuer: string, profile: Record<string,any>, done: CallableFunction) => {
        return verifyOIDC(issuer, profile.id, profile.displayName, done);
    }
);

export const googleOIDCRouter = express.Router();

googleOIDCRouter.get("/login/google", passport.authenticate("google"));
googleOIDCRouter.get("/oauth2/redirect/accounts.google.com", passport.authenticate(
    "google",
    {
        successReturnToOrRedirect: "/",
        failureRedirect: "/error"
    }
));
