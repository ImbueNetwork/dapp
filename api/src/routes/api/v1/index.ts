import express from "express";
import projectsRouter from "./projects";
import contributionsRouter from "./contributions";
import usersRouter from "./users";
import config from "../../../config";

const router = express.Router();

router.get("/user", (req, res) => {
    if (req.isAuthenticated()) {
        res.send(req.user);
    } else {
        res.status(401).end();
    }
});

router.get("/info", (req, res) => {
    res.send({
        imbueNetworkWebsockAddr: config.imbueNetworkWebsockAddr,
        relayChainWebsockAddr: config.relayChainWebsockAddr
    });
});

router.use("/projects", projectsRouter);
router.use("/users", usersRouter);
router.use("/contributions", contributionsRouter);

export default router;
