import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    console.log("This is the authenticated user:", req.user);
    res.send({message: "hello world 1234567"});
});

export default router;
