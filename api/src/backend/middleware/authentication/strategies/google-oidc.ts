import express from "express";
import type { Session } from "express-session";
import passport from "passport";
import { getOrCreateFederatedUser } from "../../../models";
import config from "../../../config";

// No @types yet :(
const OIDCStrategy = require("passport-openidconnect");

/**
 * When developing locally, not having a `clientID` and `clientSecret` will
 * prevent the server from starting, so instead of allowing that to happen, we
 * just spoof these values which effectively disables google OIDC locally.
 */
const hasGoogleCreds = Object.entries(config.oidc.google).every(([_, v]) => v);
const googleClientCredentials = hasGoogleCreds
  ? config.oidc.google
  : {
      clientID: "garbage",
      clientSecret: "garbage",
    };

export class GoogleOIDCStrategy extends OIDCStrategy {
  name: string;

  constructor(options: Record<string, any>, verify: CallableFunction) {
    super(
      {
        ...config.oidc.google,
        // i.e., this will override the `clientID` and `clientSecret` from
        // `config.oicd.google`, but preserve the other entries it had (see
        // comment above for declaration of `googleClientCredentials`):
        ...googleClientCredentials,
        ...options,
      },
      verify
    );
    this.name = "google";
  }

  authenticate(req: Express.Request, opts?: Record<string, any>) {
    super.authenticate(req, opts);
  }
}

export const googleOIDCStrategy = new GoogleOIDCStrategy(
  {
    // callbackURL: "/oauth2/redirect/accounts.google.com",
    scope: ["profile"],
    // state: true,
  },
  (issuer: string, profile: Record<string, any>, done: CallableFunction) => {
    return getOrCreateFederatedUser(
      issuer,
      profile.id,
      profile.displayName,
      done
    );
  }
);

export const googleOIDCRouter = express.Router();

googleOIDCRouter.get(
  "/login",
  (req, _res, next) => {
    if (req.query.n) {
      (req.session as any).next = req.query.n;
    }
    next();
  },
  passport.authenticate("google")
);

googleOIDCRouter.get(
  "/redirect",
  passport.authenticate("google", {
    successReturnToOrRedirect: "/redirect",
    // We don't have any error page yet
    failureRedirect: "/",
  })
);
