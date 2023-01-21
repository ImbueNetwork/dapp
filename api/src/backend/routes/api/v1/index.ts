import express from "express";
import passport from "passport";
import projectsRouter from "./projects";
import usersRouter from "./users";
import briefsRouter from "./briefs";
import config from "../../../config";
import milestonesRouter from "./milestones";
import freelancersRouter from "./freelancers";

const router = express.Router();

router.get(
    "/user",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        res.send(req.user);
    }
);

router.get("/info", (req, res) => {
    res.send({
        imbueNetworkWebsockAddr: config.imbueNetworkWebsockAddr,
        relayChainWebsockAddr: config.relayChainWebsockAddr,
    });
});

router.use("/projects", projectsRouter);
router.use("/users", usersRouter);
router.use("/milestones", milestonesRouter);
router.use("/briefs", briefsRouter);
router.use("/freelancers", freelancersRouter);
export default router;
