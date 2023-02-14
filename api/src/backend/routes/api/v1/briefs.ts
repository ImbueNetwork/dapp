import express, { response } from "express";
import db from "../../../db";
import { fetchAllBriefs, insertBrief, upsertItems, searchBriefs, BriefSqlFilter, Brief, incrementUserBriefSubmissions } from "../../../models";
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
    db.transaction(async tx => {
        const brief: Brief = req.body as Brief;
        try {
            const skill_ids = await upsertItems(brief.skills, "skills")(tx);
            const industry_ids = await upsertItems(brief.industries, "industries")(tx);
            const scope_id = await upsertItems([brief.scope_level], "scope")(tx);
            const duration_id = await upsertItems([brief.duration], "duration")(tx);
            const brief_id = await insertBrief(brief, skill_ids, industry_ids, scope_id, duration_id)(tx);
    
            if (!brief_id) {
                return next(new Error(
                    "Failed to create brief."
                ));
            }
            await incrementUserBriefSubmissions(brief.user_id)(tx);

            // Redirect to brief details page?
            res.status(201).send(
                {
                    status: "Successful",
                    brief_id: brief_id
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


router.post("/search", (req, res, next) => {
    db.transaction(async tx => {
        try {
            const data: BriefSqlFilter = req.body;
            const briefs: Array<Brief> = await searchBriefs(tx, data);
            res.send(briefs);
        } catch (e) {
            next(new Error(
                `Failed to search all briefs`,
                {cause: e as Error}
            ));
        }
    });
});


export default router;
