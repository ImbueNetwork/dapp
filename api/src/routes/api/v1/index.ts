import express from "express";
import db from "../../../db";
import * as models from "../../../models";
import projectsRouter from "./projects";

const router = express.Router();

router.get("/user", (req, res) => {
    if (req.isAuthenticated()) {
        res.send(req.user);
    } else {
        res.status(401).end();
    }
});

router.use("/projects", projectsRouter);

export default router;
