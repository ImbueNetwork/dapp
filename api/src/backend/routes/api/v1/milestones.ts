import passport from "passport";
import * as models from "../../../models";
import db from "../../../db";
import express from "express";
import {updateMilestoneDetails} from "../../../models";

const router = express.Router();


router.put("/:id/milestone/:milestoneId", passport.authenticate('jwt', { session: false }),(req, res, next) => {
    const id = req.params.id;
    const milestoneId = req.params.milestoneId;
    const details = req.body.details;


     if(details!=null)
     {
         db.transaction(async tx => {
             try {
                 // ensure the project exists first
                 const exists = await models.fetchAllMilestone(id)(tx);

                 if (!exists) {
                     return res.status(404).end();
                 }

                 const updated = await models.updateMilestoneDetails(id,milestoneId,details)(tx);

                 res.status(200).send(
                     updated
                 );
             } catch (cause) {
                 next(new Error(
                     `Failed to update milestones`,
                     {cause: cause as Error}
                 ));
             }
         });
     }
     else {
        res.status(400).send(
            {message: "details not found "}
        );
    }


});

router.get("/:id/milestones", (req, res, next) => {
    const id = req.params.id;
    db.transaction(async tx => {
        try {
            const projects = await models.fetchAllMilestone(id)(tx);
            res.send(projects);
        } catch (e) {
            next(new Error(
                `Failed to fetch all milestones`,
                {cause: e as Error}
            ));
        }
    });
});


router.get("/:id/milestone/:milestoneId", (req, res, next) => {
    const id = req.params.id;
    const milestoneId = req.params.milestoneId;
    db.transaction(async tx => {
        try {
            const milestone = await models.fetchMilestoneByIndex(id,milestoneId)(tx);
            res.send(milestone);
        } catch (e) {
            next(new Error(
                `Failed to fetch the milestone`,
                {cause: e as Error}
            ));
        }
    });
});


router.post("/", passport.authenticate('jwt', { session: false }),(req, res, next) => {
    try {
        validateMilestone(req.body.milestoneDetails);
    } catch (e) {
        res.status(400).send(
            {message: (e as Error).message}
        );
    }

    db.transaction(async tx => {
        try {
            const project = await models.updateMilestoneDetails(
                req.body.milestoneDetails.project_id,req.body.milestoneDetails.milestone_id,req.body.milestoneDetails.milestone_details
            )(tx);

            res.status(201).send(project);
        } catch (cause) {
            next(new Error(
                `Failed to add milestone details`,
                {cause: cause as Error}
            ));
        }
    });
});

const validateMilestone = (milestoneDetails: models.MilestoneDetails) => {
    if (!validateMilestone) {
        throw new Error("Missing `milestone` entry.");
    }

    const entries = Object.entries(milestoneDetails);
    if (entries.filter(([_,v]) => {
        // undefined not allowed
        return v === void 0;
    }).length
    ) {
        throw new Error(
            `Project milestone entries can't have a value of \`undefined\`.`
        );
    }
}

export default router;
