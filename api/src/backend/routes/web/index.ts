import express from "express";
import passport from "passport";
import createError from "http-errors";

const router = express.Router();

router.get("/dashboard", passport.authenticate('jwt', { session: false, failureRedirect: '/dapp/login?redirect=/dapp' }), (req, res) => {
    res.render("dashboard")
});

router.get("/login", (req, res) => {
    res.render("login")
});

router.get("/proposals", (req, res) => {
    res.render("proposals")
});

router.get("/proposals/new-details", (req, res) => {
    res.render("details")
});

router.use((_req, res, next) => {
    res.render("legacy")
});

export default router;
