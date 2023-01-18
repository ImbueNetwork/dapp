import express from "express";
import passport from "passport";
import { polkadotJsAuthRouter, polkadotJsStrategy } from "./strategies/web3/polkadot-js";
import { imbueJsAuthRouter, imbueStrategy } from "./strategies/imbue";
passport.use(polkadotJsStrategy);
passport.use(imbueStrategy);

const router = express.Router();

router.use("/auth/web3/polkadot-js", polkadotJsAuthRouter);
router.use("/auth/imbue", imbueJsAuthRouter);

router.get("/logout", (req, res, next) => {
    const redirect: string = req.query.n as string;
    res.clearCookie("access_token");
    res.redirect(
        redirect
            ? redirect
            : "/dapp"
    );
});

export default router;
