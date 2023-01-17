import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";

const router = express.Router();

type ProjectPkg = models.Project & {
    milestones: models.Milestone[]
}

type UserPkg = models.User;

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


router.post("/", (req, res, next) => {

    const {
        username,
        email,
        password

    } = req.body.user as models.User;

    db.transaction(async tx => {
        try {
            const federatedUser = models.getOrCreateFederatedUser({
                password,
                email,
                username,
                updateFederatedLoginUser(user, username, email, password)
            });
    
            if (!federatedUser.id) {
                return next(new Error(
                    "Failed to create user."
                ));
            }
    
            res.status(201).send(
                {
                    status: "Successful",
                    federatedUserId: federatedUser.id
                }
            );    
        } catch (cause) {
            next(new Error(
                `Failed to create user.`,
                {cause: cause as Error}
            ));
        }
    });
});

export default router;
