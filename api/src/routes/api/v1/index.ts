import express from "express";
import passport from "passport";
import projectsRouter from "./projects";
import usersRouter from "./users";
import config from "../../../config";

const router = express.Router();

router.get("/user", passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send(req.user);
});

router.get("/info", (req, res) => {
    res.send({
        imbueNetworkWebsockAddr: config.imbueNetworkWebsockAddr,
        relayChainWebsockAddr: config.relayChainWebsockAddr
    });
});

router.use("/projects", projectsRouter);
router.use("/users", usersRouter);

export default router;
