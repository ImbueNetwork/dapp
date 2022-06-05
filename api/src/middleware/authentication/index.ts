import express from "express";
import passport from "passport";
import { polkadotJsAuthRouter, polkadotJsStrategy } from "./strategies/web3/polkadot-js";
import type { User, Web3Account } from "../../models";
import db from "../../db";

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
        const user = await db.select().from<User>("users").where({"id": Number(id)}).first();
        if (!user) {
            done(new Error(`No user found with id: ${id}`));
        } else {
            user.web3Accounts = await db<Web3Account>("web3_accounts").select().where({
                user_id: user.id
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

router.get("/logout", (req, res, next) => {
    const redirect: string = req.query.n as string;
    res.clearCookie("access_token");
    res.redirect(
        redirect
            ? redirect
            : "/"
    );
});

export default router;
