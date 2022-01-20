import express from "express";
import passport from "passport";
import { googleOIDCStrategy, googleOIDCRouter } from "./strategies/google-oidc";
import { polkadotJsAuthRouter, polkadotjsStrategy } from "./strategies/web3/polkadot-js";
import type { User } from "./common";
import db from "../../db";


passport.use(googleOIDCStrategy);
passport.use(polkadotjsStrategy);

passport.serializeUser((user, done) => {
    return done(null, (user as User).id);
});

passport.deserializeUser(async (id: string, done) => {
    const user = await db.select().from<User>("usr").where({"id": Number(id)}).first();
    if (!user) {
        done(new Error(`No user found with id: ${id}`));
    }
    return done(null, user);
});

const router = express.Router();

router.use("/auth/web3/polkadot-js", polkadotJsAuthRouter);
router.use("/auth/oauth2/accounts.google.com", googleOIDCRouter);

router.get("/logout", (req, res, next) => {
    req.logout();
    res.redirect("/");
});

export default router;
