import express, { response } from "express";
import db from "../../../db";
import { fetchAllBriefs, insertBrief, upsertItems, searchBriefs, BriefSqlFilter, Brief, incrementUserBriefSubmissions, fetchBrief, fetchItems, fetchBriefApplications, fetchFreelancerDetailsByUserID, fetchProjectMilestones } from "../../../models";
import { json } from "stream/consumers";
import { brotliDecompress } from "zlib";
import { verifyUserIdFromJwt } from "../../../middleware/authentication/strategies/common"

const router = express.Router();

router.get("/", async (req, res, next) => {
    db.transaction(async (tx) => {
        try {
            await fetchAllBriefs()(tx).then(async (briefs: any) => {
                await Promise.all([
                    briefs,
                    ...briefs.map(async (brief: any) => {
                        brief.skills = await fetchItems(brief.skill_ids, "skills")(tx);
                        brief.industries = await fetchItems(brief.industry_ids, "skills")(tx);
                    })
                ]);
                res.send(briefs);
            });
        } catch (e) {
            next(new Error(
                `Failed to fetch all briefs`,
                { cause: e as Error }
            ));
        }
    });
});

router.get("/:id", (req, res, next) => {
    const id = req.params.id;
    db.transaction(async tx => {
        try {
            const brief = await fetchBrief(id)(tx);
            await Promise.all([
                brief.skills = await fetchItems(brief.skill_ids, "skills")(tx),
                brief.industries = await fetchItems(brief.industry_ids, "skills")(tx),
            ]);
            res.send(brief);
        } catch (e) {
            next(new Error(
                `Failed to fetch brief with id ${id}`,
                { cause: e as Error }
            ));
        }
    });
});

router.get("/:id/applications", (req, res, next) => {
    const id = req.params.id;
    db.transaction(async tx => {
        try {
            const briefApplications = await fetchBriefApplications(id)(tx);

            const response = await Promise.all(briefApplications.map(async (application) => {
                return {
                    ...application,
                    freelancer: await fetchFreelancerDetailsByUserID(application.user_id)(tx),
                    milestones: await fetchProjectMilestones(application.id)(tx)
                }
            }));

            res.send(response);
        } catch (e) {
            next(new Error(
                `Failed to fetch brief applications with id ${id}`,
                { cause: e as Error }
            ));
        }
    });
});

router.post("/", (req, res, next) => {
    db.transaction(async tx => {
        const brief: Brief = req.body as Brief;
        verifyUserIdFromJwt(req, res, next, brief.user_id)

        try {
            const skill_ids = await upsertItems(brief.skills, "skills")(tx);
            const industry_ids = await upsertItems(brief.industries, "industries")(tx);
            const brief_id = await insertBrief(brief, skill_ids, industry_ids, brief.scope_id, brief.duration_id)(tx);
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
                { cause: cause as Error }
            ));
        }
    });
});

router.post("/search", (req, res, next) => {
    db.transaction(async tx => {
        try {
            const data: BriefSqlFilter = req.body;
            const briefs: Array<Brief> = await searchBriefs(tx, data);

            await Promise.all([
                briefs,
                ...briefs.map(async (brief: any) => {
                    brief.skills = await fetchItems(brief.skill_ids, "skills")(tx);
                    brief.industries = await fetchItems(brief.industry_ids, "skills")(tx);
                })
            ]);

            res.send(briefs);
        } catch (e) {
            next(new Error(
                `Failed to search all briefs`,
                { cause: e as Error }
            ));
        }
    });
});


export default router;
