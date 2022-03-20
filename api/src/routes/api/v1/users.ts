import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";

type ProjectsPkg = models.Project[]

const router = express.Router();


router.get("/:id/projects", (req, res, next) => {
    const id = req.params.id;


    db.transaction(async tx => {
        try {
            const projects: models.Project[] = await models.fetchUserProjects(id)(tx);
            if (!projects) {
                return res.status(404).end();
            }
            res.send(projects);

        } catch (e) {
            next(new Error(
                `Failed to fetch projects for user id: ${id}`,
                { cause: e as Error }
            ));
        }
    });
});

export default router;
