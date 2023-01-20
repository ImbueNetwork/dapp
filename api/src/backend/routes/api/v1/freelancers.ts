import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";
import passport from "passport";

const router = express.Router();

router.get("/", (req, res, next) => {
    db.transaction(async tx => {
        try {
            const freelancers = await models.fetchAllFreelancers()(tx);
            res.send(freelancers);
        } catch (e) {
            next(new Error(
                `Failed to fetch all briefs`,
                {cause: e as Error}
            ));
        }
    });
});

router.get("/:id", (req, res, next) => {
    const userId = req.params.id;

    db.transaction(async tx => {
        try {
            const freelancer = await models.fetchFreelancerDetailsByUserID(userId)(tx);

            if (!freelancer) {
                return res.status(404).end();
            }
            res.send(freelancer);
        } catch (e) {
            next(new Error(
                `Failed to fetch freelancer details by userid: ${userId}`,
                {cause: e as Error}
            ));
        }
    });
});

router.post("/", (req, res, next) => {

    const {
        education,
        experience,
        freelancing_goal,
        freelanced_before,
        skills,
        bio,
        title,
        languages,
        work_type,
        services_offer,
        user_id

    } = req.body.freelancer as models.Freelancer;

    db.transaction(async tx => {
        try {
            const freelancer = await models.insertFreelancerDetails({
                education,
                experience,
                freelancing_goal,
                freelanced_before,
                skills,
                bio,
                title,
                languages,
                work_type,
                services_offer,
                user_id
            })(tx);

            if (!freelancer.id) {
                return next(new Error(
                    "Failed to insert freelancer details."
                ));
            }

            res.status(201).send(
                {
                    status: "Successful",
                    freelancer_id: freelancer.id
                }
            );
        } catch (cause) {
            next(new Error(
                `Failed to insert freelancer details .`,
                {cause: cause as Error}
            ));
        }
    });
});


router.put("/:id", (req, res, next) => {
    const id = req.params.id;
    const {
        education,
        experience,
        freelancing_goal,
        freelanced_before,
        skills,
        bio,
        title,
        languages,
        work_type,
        services_offer,
        user_id
    } = req.body.freelancer as models.Freelancer;

    db.transaction(async tx => {
        try {
            // ensure the freelancer exists first
            const freelancerDetails = await models.fetchFreelancerDetailsByUserID(id)(tx);

            if (!freelancerDetails) {
                return res.status(404).end();
            }

            if (freelancerDetails.user_id !== id) {
                return res.status(403).end();
            }

            const freelancer = await models.updateFreelancerDetails(id, {
                education,
                experience,
                freelancing_goal,
                freelanced_before,
                skills,
                bio,
                title,
                languages,
                work_type,
                services_offer,
                user_id
            })(tx);

            if (!freelancer.id) {
                return next(new Error(
                    "Cannot update freelancer details: `id` missing."
                ));
            }
            res.status(200).send(freelancer);
        } catch (cause) {
            next(new Error(
                `Failed to update freelancer details.`,
                {cause: cause as Error}
            ));
        }
    });
});

export default router;
