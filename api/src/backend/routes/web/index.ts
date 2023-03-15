import express from "express";
import passport from "passport";

const router = express.Router();

router.get(
    "/dashboard",
    passport.authenticate("jwt", {
        session: false,
        failureRedirect: "/dapp/login?redirect=/dapp/dashboard",
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
router.get("/projects/new", (req, res) => {
    res.render("new-project");
});

router.get("/proposals/:projectId", (req, res) => {
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

router.get("/briefs/:id/apply", function (req, res, next) {
    passport.authenticate("jwt", {
        session: false,
        failureRedirect: `/dapp/login?redirect=/dapp/briefs/${req.params.id}/apply`,
    })(req, res, next)
}, (req, res) => {
    res.render("submit-proposal");
});

router.get("/briefs/:id/applications", (req, res) => {
    res.render("brief-applications");
});

router.get("/briefs/:id/applications/:application_id", (req, res) => {
    res.render("application-preview");
});

router.get("/my-briefs", (req, res) => {
    res.render("hirer-dashboard");
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

router.get("/freelancers/", (req, res) => {
    res.render("freelancers");
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