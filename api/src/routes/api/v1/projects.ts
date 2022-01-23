import express from "express";
import db from "../../../db";
import * as models from "../../../models";


type ProjectPkg = models.Project & {
    milestones: models.Milestone[]
}

const router = express.Router();

router.get("/:id", (req, res, next) => {
    const id = req.params.id;

    db.transaction(async tx => {
        try {
            const project = await models.fetchProject(id)(tx);

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
                `Failed to fetch project by id: ${id}`,
                {cause: e as Error}
            ));
        }
    });
});

router.post("/", (req, res, next) => {
    if (!req.user) {
        res.status(401).end();
    }

    const {
        name,
        logo,
        description,
        website,
        category,
        required_funds,
        owner,
        usr_id,
        milestones,
    } = req.body.proposal as models.GrantProposal;

    // TODO: need validation here

    db.transaction(async tx => {
        try {
            const project = await models.insertProject({
                name,
                logo,
                description,
                website,
                category,
                required_funds,
                owner,
                usr_id,
            })(tx);
    
            if (!project.id) {
                return next(new Error(
                    "Failed to insert milestones: `project_id` missing."
                ));
            }
    
            const pkg: ProjectPkg = {
                ...project,
                milestones: await models.insertMilestones(
                    milestones,
                    project.id,
                )(tx)
            }
    
            res.status(201).send(pkg);    
        } catch (cause) {
            next(new Error(
                `Failed to insert project.`,
                {cause: cause as Error}
            ));
        }
    });
});

// need put method for update


export default router;
