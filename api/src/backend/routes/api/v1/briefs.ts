import express, { response } from "express";
import db from "../../../db";
import { fetchAllBriefs, searchBriefs, BriefSqlFilter, Brief } from "../../../models";
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
