import express from "express";
import passport from "passport";
import { googleOIDCStrategy, googleOIDCRouter } from "./strategies/google-oidc";
import { polkadotJsAuthRouter, polkadotJsStrategy } from "./strategies/web3/polkadot-js";
import type { Imbuer, Web3Account } from "../../models";
import db from "../../db";


passport.use(googleOIDCStrategy);
passport.use(polkadotJsStrategy);

/**
 * The `user` term here is specific to the passport workflow, but in this
 * system we refer to "users" as `imbuer` instead.
 */
passport.serializeUser((user, done) => {
    if (!(user as any).id) {
        return done(
            new Error("Failed to serialize User: no `id` found.")
        );
    }
    return done(null, (user as Imbuer).id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const imbuer = await db.select().from<Imbuer>("imbuer").where({"id": Number(id)}).first();
        if (!imbuer) {
            done(new Error(`No user found with id: ${id}`));
        } else {
            imbuer.web3Accounts = await db<Web3Account>("web3_account").select().where({
                imbuer_id: imbuer.id
            });
            return done(null, imbuer);
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
