import express, { response } from "express";
import db from "../../../db";
import { fetchAllBriefs, insertBrief, searchBriefs, BriefSqlFilter, Brief } from "../../../models";
import { json } from "stream/consumers";



const router = express.Router();

router.get("/", (req, res, next) => {

    db.transaction(async tx => {
        try {
            const briefs = await fetchAllBriefs()(tx);
            res.send(briefs);
        } catch (e) {
            next(new Error(
                `Failed to fetch all briefs`,
                {cause: e as Error}
            ));
        }
    });
});


router.post("/", (req, res, next) => {

    const {
        headline,
        industries,
        description,
        skills,
        experience_id,
        scope,
        duration,
        budget,
        user_id

    } = req.body.brief as Brief;

    db.transaction(async tx => {
        try {
            const brief = await insertBrief({
                headline,
                industries,
                description,
                skills,
                experience_id,
                scope,
                duration,
                budget,
                user_id,
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
