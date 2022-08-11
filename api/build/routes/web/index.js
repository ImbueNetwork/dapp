"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
router.get("/dashboard", passport_1.default.authenticate('jwt', { session: false, failureRedirect: '/dapp/login?redirect=/dapp' }), (req, res) => {
    res.render("dashboard");
});
router.get("/login", (req, res) => {
    res.render("login");
});
router.use((_req, res, next) => {
    res.render("legacy");
});
exports.default = router;
