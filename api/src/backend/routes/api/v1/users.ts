import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";
import { User, getOrCreateFederatedUser, updateFederatedLoginUser, fetchUserBriefs, fetchBriefApplications, fetchBriefProjects, fetchProjectMilestones } from "../../../models";

// @ts-ignore
import * as passportJwt from "passport-jwt"
// @ts-ignore
import jwt from 'jsonwebtoken';

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

router.get("/:id/briefs/:briefId", (req, res, next) => {
    const id = req.params.id;
    const briefId = req.params.briefId;
    db.transaction(async tx => {
        try {
            const project = await models.fetchUserBriefApplications(id,briefId)(tx);
            
            if (!project) {
                return res.status(404).end();
            }

            const pkg: ProjectPkg = {
                ...project,
                milestones: await models.fetchProjectMilestones(Number(project.id))(tx)
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

router.get("/:id/briefs", (req, res, next) => {
    const id = req.params.id;
    db.transaction(async tx => {
        try {
            const briefs = await fetchUserBriefs(id)(tx);
            const pendingReviewBriefs = briefs.filter(m => m.project_id == null);
            const briefsWithProjects = briefs.filter(m => m.project_id !== null);

            const briefsUnderReview = await Promise.all(pendingReviewBriefs.map(async (brief) => {
                return {
                    ...brief,
                    number_of_applications: (await fetchBriefApplications(brief.id)(tx)).length
                }
            }));

            const acceptedBriefs = await Promise.all(briefsWithProjects.map(async (brief) => {
                return {
                    ...brief,
                    project: (await models.fetchProject(brief.project_id)(tx)),
                    milestones: (await fetchProjectMilestones(brief.project_id)(tx))
                }
            }));

            const response = {
                briefsUnderReview,
                acceptedBriefs,
            }

            res.send(response);
        } catch (e) {
            next(new Error(
                `Failed to fetch all briefs for user id ${id}`,
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
    } = req.body;

    let updateUserDetails = async (err: Error, user: User) => {
        if (err) {
            next(err);
        }

        if (!user) {
            next(new Error("No user provided."));
        }

        db.transaction(async tx => {
            try {
                const updatedUser = await updateFederatedLoginUser(
                    user, username, email, password
                )(tx);

                res.send(updatedUser);
            } catch (e) {
                tx.rollback();
                next(new Error(
                    `Unable to upsert details for user: ${username}`,
                    { cause: e as Error }
                ));
            }
        });
    };

    getOrCreateFederatedUser(
        "Imbue Network",
        email,
        username,
        updateUserDetails);

});


router.get("/:userOrEmail", (req, res, next) => {
    const userOrEmail = req.params.userOrEmail;
    db.transaction(async tx => {
        try {
            const user: User = await models.fetchUserOrEmail(userOrEmail)(tx) as User;
            if (!user) {
                return res.status(404).end();
            }
            res.send({id: user.id, display_name: user.display_name, username: user.username});
        } catch (e) {
            next(new Error(
                `Failed to fetch user ${userOrEmail}`,
                { cause: e as Error }
            ));
        }
    });
});

router.get("/byid/:id", (req, res, next) => {
    const id = Number(req.params.id);
    db.transaction(async tx => {
        try {
            const user: User = await models.fetchUser(id)(tx) as User;
            if (!user) {
                return res.status(404).end();
            }
            res.send({id: user.id, display_name: user.display_name, username: user.username});
        } catch (e) {
            next(new Error(
                `Failed to fetch user ${id}`,
                { cause: e as Error }
            ));
        }
    });
});

export default router;
