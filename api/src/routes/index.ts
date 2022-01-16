import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    console.log("This is the authenticated user:", req.user);
    res.send({message: "hello world 1234567"});
});

export default router;


// next up is getting the current state of this app (api) running in docker-compose
// above will require edits to nginx.conf, etc., for /api/v1 and any authentication endpoints
// then scaffolding a login page from existing webflow sources