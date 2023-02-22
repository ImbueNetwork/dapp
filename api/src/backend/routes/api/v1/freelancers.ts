import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";
import passport from "passport";
import { upsertItems } from "../../../models";
import {Freelancer} from "../../../models"

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
                return res.status(404).end();
            }
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
    const freelancer = req.body.freelancer as Freelancer;

    db.transaction(async tx => {
        try {
            const skill_ids = await upsertItems(freelancer.skills, "skills")(tx);
            const language_ids = await upsertItems(freelancer.languages, "languages")(tx);
            const services_ids = await upsertItems(freelancer.services, "services")(tx);
            let client_ids: number[] = [] 

            if (freelancer.clients) {
                client_ids = await upsertItems(freelancer.clients, "services")(tx);
            } 
            const freelancer_id = await models.insertFreelancerDetails(
                freelancer, skill_ids, language_ids, client_ids, services_ids
            )(tx);

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

router.put("/:username", (req, res, next) => {
    // TODO VERIFY user is allowed to edit table
    const username = req.params.username;
    const freelancer = req.body.freelancer as Freelancer;
    
    db.transaction(async tx => {
        try {
            // ensure the freelancer exists first
            // Is this needed? surely it will just fail as its an update.
            const exists: Freelancer = await models.fetchFreelancerDetailsByUsername(username)(tx);
            console.log(freelancer);
            if (!exists) {
                return next(new Error(
                    "Freelancer does not exist."
                ));
            }
            const fl_id = await models.updateFreelancerDetails(exists.user_id, freelancer)(tx);
            const updated_freelancer_details = await models.fetchFreelancerDetailsByUsername(username)(tx);

            res.status(200).send(updated_freelancer_details);
        } catch (cause) {
            next(new Error(
                `Failed to update freelancer details.`,
                {cause: cause as Error}
            ));
        }
    });
});

export default router;
