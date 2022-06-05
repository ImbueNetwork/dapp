import express from "express";
import passport from "passport";
import { polkadotJsAuthRouter, polkadotJsStrategy } from "./strategies/web3/polkadot-js";

passport.use(polkadotJsStrategy);

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
