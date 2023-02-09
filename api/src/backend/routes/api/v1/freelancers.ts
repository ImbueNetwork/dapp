import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";
import passport from "passport";
import { upsertItems } from "../../../models";

const router = express.Router();

router.get("/", (req, res, next) => {
    db.transaction(async tx => {
        try {
            const freelancers = await models.fetchAllFreelancers()(tx);
            res.send(freelancers);
        } catch (e) {
            next(new Error(
                `Failed to fetch all freelancers`,
                {cause: e as Error}
            ));
        }
    });
});

router.get("/:username", (req, res, next) => {
    const username = req.params.username;
    db.transaction(async tx => {
        try {
            const freelancer = await models.fetchFreelancerDetailsByUsername(username)(tx);
            if (!freelancer) {
                console.log("freelancer");
                return res.status(404).end();
            }
            console.log(freelancer);

            res.send(freelancer);
        } catch (e) {
            next(new Error(
                `Failed to fetch freelancer details by userid: ${username}`,
                {cause: e as Error}
            ));
        }
    });
});

router.post("/", (req, res, next) => {
    // TODO VERIFY user is allowed to edit table

    const {
        client_ids,
        discord_link,
        education,
        experience,
        facebook_link,
        freelancing_goal,
        freelanced_before,
        skills,
        bio,
        title,
        twitter_link,
        telegram_link,
        languages,
        work_type,
        services,
        user_id,
    } = req.body.freelancer;

    db.transaction(async tx => {
        try {
            const skill_ids = await upsertItems(skills, "skills")(tx);
            const language_ids = await upsertItems(languages, "languages")(tx);
            const services_ids = await upsertItems(services, "services")(tx);
            const freelancer_id = await models.insertFreelancerDetails({
                education,
                experience,
                freelancing_goal,
                freelanced_before,
                skill_ids,
                language_ids,
                client_ids,
                bio,
                title,
                work_type,
                services_ids,
                facebook_link,
                twitter_link,
                telegram_link,
                discord_link,
                user_id,
            })(tx);

            if (!freelancer_id) {
                return next(new Error(
                    "Failed to insert freelancer details."
                ));
            }

            res.status(201).send(
                {
                    status: "Successful",
                    freelancer_id: freelancer_id
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
    // TODO VERIFY user is allowed to edit table
    const id = req.params.id;
    const {
        client_ids,
        discord_link,
        education,
        experience,
        facebook_link,
        freelancing_goal,
        freelanced_before,
        skill_ids,
        bio,
        title,
        twitter_link,
        telegram_link,
        language_ids,
        work_type,
        services_ids,
    } = req.body.freelancer;

    db.transaction(async tx => {
        try {
            // ensure the freelancer exists first
            const freelancerDetails = await models.fetchFreelancerDetailsByUserID(id)(tx);

            if (!freelancerDetails) {
                return res.status(404).end();
            }


            const freelancer = await models.updateFreelancerDetails(id, {
                education,
                experience,
                freelancing_goal,
                freelanced_before,
                skill_ids,
                language_ids,
                client_ids,
                bio,
                title,
                work_type,
                services_ids,
                facebook_link,
                twitter_link,
                telegram_link,
                discord_link,
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
