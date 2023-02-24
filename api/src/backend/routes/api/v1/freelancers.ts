import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";
import passport from "passport";
import { upsertItems, fetchAllFreelancers, fetchItems, FreelancerSqlFilter, fetchFreelancerDetailsByUsername, updateFreelancerDetails, insertFreelancerDetails, searchFreelancers } from "../../../models";
import { Freelancer } from "../../../models"
// import the history module

// create a new history object
const router = express.Router();

router.get("/", (req, res, next) => {
    db.transaction(async tx => {
        try {
            await fetchAllFreelancers()(tx).then(async (freelancers: any) => {
                await Promise.all([
                    ...freelancers.map(async (freelancer: any) => {
                        freelancer.skills = await fetchItems(freelancer.skill_ids, "skills")(tx);
                        freelancer.client_images = await fetchItems(freelancer.client_ids, "clients")(tx);
                        freelancer.languages = await fetchItems(freelancer.language_ids, "languages")(tx);
                        freelancer.services = await fetchItems(freelancer.service_ids, "services")(tx);
                    })
                ]);
                res.send(freelancers);
            });

        } catch (e) {
            next(new Error(
                `Failed to fetch all freelancers`,
                { cause: e as Error }
            ));
        }
    });
});


router.get("/:username", (req, res, next) => {
    const username = req.params.username;
    db.transaction(async tx => {
        try {
            const freelancer = await fetchFreelancerDetailsByUsername(username)(tx);
            await Promise.all([
                freelancer.skills = await fetchItems(freelancer.skill_ids, "skills")(tx),
                freelancer.client_images = await fetchItems(freelancer.client_ids, "clients")(tx),
                freelancer.languages = await fetchItems(freelancer.language_ids, "languages")(tx),
                freelancer.services = await fetchItems(freelancer.service_ids, "services")(tx),
            ]);

            if (!freelancer) {
                return res.status(404).end();
            }
            res.send(freelancer);
        } catch (e) {
            next(new Error(
                `Failed to fetch freelancer details by userid: ${username}`,
                { cause: e as Error }
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
            const freelancer_id = await insertFreelancerDetails(
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
                { cause: cause as Error }
            ));
        }
    });
});

router.put("/:username", (req, res, next) => {
    // TODO VERIFY user is allowed to edit table
    // Verification happens before we get here.
    const username = req.params.username;
    const freelancer = req.body.freelancer as Freelancer;

    db.transaction(async tx => {
        try {
            // ensure the freelancer exists first
            const freelancerDetails = await fetchFreelancerDetailsByUsername(username)(tx);

            if (!freelancerDetails) {
                return res.status(404).end();
            }

            const freelancer_id: Freelancer = await updateFreelancerDetails(freelancer.user_id, freelancer)(tx);

            if (!freelancer.id) {
                return next(new Error(
                    "Cannot update freelancer details: `id` missing."
                ));
            }
            res.status(200).send(freelancer);
        } catch (cause) {
            next(new Error(
                `Failed to update freelancer details.`,
                { cause: cause as Error }
            ));
        }
    });
});

router.post("/search", (req, res, next) => {
    db.transaction(async tx => {
        try {
            const filter: FreelancerSqlFilter = req.body;
            console.log(filter);
            const freelancers: Array<Freelancer> = await searchFreelancers(tx, filter);
            await Promise.all([
                ...freelancers.map(async (freelancer: any) => {
                    freelancer.skills = await fetchItems(freelancer.skill_ids, "skills")(tx);
                    freelancer.client_images = await fetchItems(freelancer.client_ids, "clients")(tx);
                    freelancer.languages = await fetchItems(freelancer.language_ids, "languages")(tx);
                    freelancer.services = await fetchItems(freelancer.service_ids, "services")(tx);
                })
            ]);

            res.send(freelancers);
        } catch (e) {
            next(new Error(
                `Failed to search all freelancers`,
                { cause: e as Error }
            ));
        }
    });
});

export default router;
