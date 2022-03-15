import express from "express";
import db from "../../../db";
import * as models from "../../../models";
import projectsRouter from "./projects";
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
        imbueNetworkWebsockAddr: config.imbueNetworkWebsockAddr
    });
});

router.use("/projects", projectsRouter);
router.use("/users", usersRouter);

export default router;
