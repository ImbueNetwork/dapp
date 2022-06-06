"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const projects_1 = __importDefault(require("./projects"));
const users_1 = __importDefault(require("./users"));
const config_1 = __importDefault(require("../../../config"));
const router = express_1.default.Router();
router.get("/user", passport_1.default.authenticate('jwt', { session: false }), (req, res) => {
    res.send(req.user);
});
router.get("/info", (req, res) => {
    res.send({
        imbueNetworkWebsockAddr: config_1.default.imbueNetworkWebsockAddr,
        relayChainWebsockAddr: config_1.default.relayChainWebsockAddr
    });
});
router.use("/projects", projects_1.default);
router.use("/users", users_1.default);
exports.default = router;
