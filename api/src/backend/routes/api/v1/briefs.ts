import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";
import passport from "passport";


type BriefPkg = models.Brief;

/**
 * FIXME: all of this is terriblme
 */

const router = express.Router();

router.get("/", (req, res, next) => {
    //const brief_parameters: BriefFilter = req.body

    db.transaction(async tx => {
        try {
            const briefs = await models.fetchAllBriefs()(tx);
            res.send(briefs);
        } catch (e) {
            next(new Error(
                `Failed to fetch all briefs`,
                {cause: e as Error}
            ));
        }
    });
});



/*
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



/**
 * TODO: json schema or something better instead.
 */



router.post("/", (req, res, next) => {

    const {
        headline,
        industries,
        description,
        skills,
        scope,
        duration,
        budget,
        user_id,
        experience_level,
        hours_per_week,

    } = req.body.brief as models.Brief;

    db.transaction(async tx => {
        try {
            const brief = await models.insertBrief({
                headline,
                industries,
                description,
                skills,
                scope,
                duration,
                budget,
                user_id,
                experience_level,
                hours_per_week,
            })(tx);
    
            if (!brief.id) {
                return next(new Error(
                    "Failed to create brief."
                ));
            }
    
            res.status(201).send(
                {
                    status: "Successful",
                    brief_id: brief.id
                }
            );    
        } catch (cause) {
            next(new Error(
                `Failed to insert brief .`,
                {cause: cause as Error}
            ));
        }
    });
});




export default router;
