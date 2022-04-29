"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../../../db"));
const models = __importStar(require("../../../models"));
const router = express_1.default.Router();
router.get("/:id/project", (req, res, next) => {
    const id = req.params.id;
    db_1.default.transaction(async (tx) => {
        try {
            const project = await models.fetchUserProject(id)(tx);
            if (!project) {
                return res.status(404).end();
            }
            const pkg = {
                ...project,
                milestones: await models.fetchProjectMilestones(id)(tx)
            };
            res.send(pkg);
        }
        catch (e) {
            next(new Error(`Failed to fetch projects for user id: ${id}`, { cause: e }));
        }
    });
});
exports.default = router;
