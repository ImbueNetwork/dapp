import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";

const router = express.Router();

type ProjectPkg = models.Project & {
    milestones: models.Milestone[]
}

router.get("/:id/project", (req, res, next) => {
    const id = req.params.id;

    db.transaction(async tx => {
        try {
            const project = await models.fetchUserProject(id)(tx);
            if (!project) {
                return res.status(404).end();
            }

            const pkg: ProjectPkg = {
                ...project,
                milestones: await models.fetchProjectMilestones(id)(tx)
            };

            res.send(pkg);
        } catch (e) {
            next(new Error(
                `Failed to fetch projects for user id: ${id}`,
                { cause: e as Error }
            ));
        }
    });
});

export default router;
