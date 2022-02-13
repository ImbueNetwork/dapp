import express from "express";
import passport from "passport";
import { googleOIDCStrategy, googleOIDCRouter } from "./strategies/google-oidc";
import { polkadotJsAuthRouter, polkadotJsStrategy } from "./strategies/web3/polkadot-js";
import type { User, Web3Account } from "../../models";
import db from "../../db";


passport.use(googleOIDCStrategy);
passport.use(polkadotJsStrategy);

passport.serializeUser((user, done) => {
    if (!(user as any).id) {
        return done(
            new Error("Failed to serialize User: no `id` found.")
        );
    }
    return done(null, (user as User).id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await db.select().from<User>("usr").where({"id": Number(id)}).first();
        if (!user) {
            done(new Error(`No user found with id: ${id}`));
        } else {
            user.web3Accounts = await db<Web3Account>("web3_account").select().where({
                usr_id: user.id
            });
            return done(null, user);
        }
    } catch (e) {
        return done(
            new Error(
                `Failed to deserialize user with id ${id}`,
                {cause: e as Error}
            )
        );
    }
});

const router = express.Router();

router.use("/auth/web3/polkadot-js", polkadotJsAuthRouter);
router.use("/auth/oauth2/accounts.google.com", googleOIDCRouter);

router.get("/auth", (req, res, _next) => {
    return res.status(
        req.isAuthenticated()
            ? 200
            : 401
    ).end();
});

router.get("/logout", (req, res, next) => {
    const redirect: string = req.query.n as string;
    req.logout();
    res.redirect(
        redirect
            ? redirect
            : "/"
    );
});

export default router;
