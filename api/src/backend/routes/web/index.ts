import express from "express";
import passport from "passport";
import createError from "http-errors";

const router = express.Router();

router.get(
    "/dashboard",
    passport.authenticate("jwt", {
        session: false,
        failureRedirect: "/dapp/login?redirect=/dapp",
    }),
    (req, res) => {
        res.render("dashboard");
    }
);

router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/", (req, res) => {
    res.render("proposals");
});

router.get("/proposals", (req, res) => {
    res.render("proposals");
});

router.get("/proposals/new-details", (req, res) => {
    res.render("details");
});

router.get("/projects/:projectId", (req, res) => {
    res.render("details");
});

router.get("/briefs", (req, res) => {
    res.render("briefs");
});



router.get(
    "/briefs/new",
    passport.authenticate("jwt", {
        session: false,
        failureRedirect: "/dapp/login?redirect=/dapp/briefs/new",
    }),
    (req, res) => {
        res.render("new-brief");
    }
);

router.get("/briefs/:id", (req, res) => {
    res.render("brief-details");
});

router.get("/join", (req, res) => {
    res.render("join");
});

router.get("/googlelogin", (req, res) => {
    res.render("googlelogin");
});

router.get("/briefs/", (req, res) => {
    res.render("briefs");
});

router.get(
    "/freelancers/new",
    passport.authenticate("jwt", {
        session: false,
        failureRedirect: "/dapp/login?redirect=/dapp/freelancers/new",
    }),
    (req, res) => {
        res.render("new-freelancer");
    }
);

router.get("/freelancers/:username", (req, res) => {
    res.render("freelancer-profile");
});

router.use((_req, res, next) => {
    res.render("legacy");
});

export default router;
