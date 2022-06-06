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
const passport_1 = __importDefault(require("passport"));
/**
 * FIXME: all of this is terriblme
 */
const router = express_1.default.Router();
router.get("/", (req, res, next) => {
    db_1.default.transaction(async (tx) => {
        try {
            const projects = await models.fetchAllProjects()(tx);
            res.send(projects);
        }
        catch (e) {
            next(new Error(`Failed to fetch all projects`, { cause: e }));
        }
    });
});
router.get("/:id", (req, res, next) => {
    const id = req.params.id;
    db_1.default.transaction(async (tx) => {
        try {
            const project = await models.fetchProject(id)(tx);
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
            next(new Error(`Failed to fetch project by id: ${id}`, { cause: e }));
        }
    });
});
/**
 * TODO: json schema or something better instead.
 */
const validateProposal = (proposal) => {
    if (!proposal) {
        throw new Error("Missing `proposal` entry.");
    }
    const entries = Object.entries(proposal);
    if (entries.filter(([_, v]) => {
        // undefined not allowed
        return v === void 0;
    }).length) {
        throw new Error(`Proposal entries can't have a value of \`undefined\`.`);
    }
};
router.post("/", passport_1.default.authenticate('jwt', { session: false }), (req, res, next) => {
    try {
        validateProposal(req.body.proposal);
    }
    catch (e) {
        res.status(400).send({ message: e.message });
    }
    const { name, logo, description, website, category, required_funds, currency_id, owner, milestones, } = req.body.proposal;
    db_1.default.transaction(async (tx) => {
        try {
            const project = await models.insertProject({
                name,
                logo,
                description,
                website,
                category,
                required_funds,
                currency_id,
                owner,
                user_id: req.user.id,
            })(tx);
            if (!project.id) {
                return next(new Error("Failed to insert milestones: `project_id` missing."));
            }
            const pkg = {
                ...project,
                milestones: await models.insertMilestones(milestones, project.id)(tx)
            };
            res.status(201).send(pkg);
        }
        catch (cause) {
            next(new Error(`Failed to insert project.`, { cause: cause }));
        }
    });
});
router.put("/:id", passport_1.default.authenticate('jwt', { session: false }), (req, res, next) => {
    const id = req.params.id;
    try {
        validateProposal(req.body.proposal);
    }
    catch (e) {
        res.status(400).send({ message: e.message });
    }
    const { name, logo, description, website, category, chain_project_id, required_funds, currency_id, owner, milestones, } = req.body.proposal;
    const user_id = req.user.id;
    db_1.default.transaction(async (tx) => {
        try {
            // ensure the project exists first
            const exists = await models.fetchProject(id)(tx);
            if (!exists) {
                return res.status(404).end();
            }
            if (exists.user_id !== user_id) {
                return res.status(403).end();
            }
            const project = await models.updateProject(id, {
                name,
                logo,
                description,
                website,
                category,
                chain_project_id,
                required_funds,
                currency_id,
                owner,
                // user_id,
            })(tx);
            if (!project.id) {
                return next(new Error("Cannot update milestones: `project_id` missing."));
            }
            // drop then recreate
            await models.deleteMilestones(id)(tx);
            const pkg = {
                ...project,
                milestones: await models.insertMilestones(milestones, project.id)(tx)
            };
            res.status(200).send(pkg);
        }
        catch (cause) {
            next(new Error(`Failed to update project.`, { cause: cause }));
        }
    });
});
const validateProperties = (properties) => {
    if (!properties) {
        throw new Error("Missing `properties` entry.");
    }
    const entries = Object.entries(properties);
    if (entries.filter(([_, v]) => {
        // undefined not allowed
        return v === void 0;
    }).length) {
        throw new Error(`Project property entries can't have a value of \`undefined\`.`);
    }
};
router.get('/:id/properties', passport_1.default.authenticate('jwt', { session: false }), (req, res, next) => {
    const id = req.params.id;
    db_1.default.transaction(async (tx) => {
        try {
            const project = await models.fetchProjectWithProperties(id)(tx);
            if (!project) {
                return res.status(404).end();
            }
            res.send(project);
        }
        catch (e) {
            next(new Error(`Failed to fetch project by id: ${id}`, { cause: e }));
        }
    });
});
router.put("/:id/properties", passport_1.default.authenticate('jwt', { session: false }), (req, res, next) => {
    const id = req.params.id;
    try {
        validateProperties({ ...req.body.properties, project_id: id });
    }
    catch (e) {
        res.status(400).send({ message: e.message });
    }
    const { faq } = req.body.properties;
    db_1.default.transaction(async (tx) => {
        try {
            // ensure the project exists first
            const exists = await models.fetchProject(id)(tx);
            if (!exists) {
                return res.status(404).end();
            }
            const updated = await models.updateProjectProperties(id, {
                faq
            })(tx);
            res.status(200).send({
                ...exists,
                properties: updated
            });
        }
        catch (cause) {
            next(new Error(`Failed to update project properties.`, { cause: cause }));
        }
    });
});
exports.default = router;
