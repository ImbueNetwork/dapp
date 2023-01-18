import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";
import { User, getOrCreateFederatedUser, updateFederatedLoginUser } from "../../../models";

// @ts-ignore
import * as passportJwt from "passport-jwt"
// @ts-ignore
import jwt from 'jsonwebtoken';

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
            const user = await models.fetchUserOrEmail(userOrEmail)(tx);
            if (!user) {
                return res.status(404).end();
            }
            res.send(user);
        } catch (e) {
            next(new Error(
                `Failed to fetch user ${userOrEmail}`,
                { cause: e as Error }
            ));
        }
    });
});


export default router;
