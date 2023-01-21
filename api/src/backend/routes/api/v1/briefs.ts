import express, { response } from "express";
import db from "../../../db";
import * as models from "../../../models";
import passport from "passport";


type BriefPkg = models.Brief;

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

export default router;
