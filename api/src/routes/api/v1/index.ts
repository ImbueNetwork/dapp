import express from "express";

const router = express.Router();

router.get("/user", (req, res) => {
    if (req.isAuthenticated()) {
        res.send(req.user);
    } else {
        res.status(401).end();
    }
});


export default router;
