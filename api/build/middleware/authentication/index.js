"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const polkadot_js_1 = require("./strategies/web3/polkadot-js");
passport_1.default.use(polkadot_js_1.polkadotJsStrategy);
const router = express_1.default.Router();
router.use("/auth/web3/polkadot-js", polkadot_js_1.polkadotJsAuthRouter);
router.get("/logout", (req, res, next) => {
    const redirect = req.query.n;
    res.clearCookie("access_token");
    res.redirect(redirect
        ? redirect
        : "/");
});
exports.default = router;
