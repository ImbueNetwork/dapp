"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const { decodeAddress, encodeAddress } = require('@polkadot/keyring');
const { hexToU8a, isHex } = require('@polkadot/util');
const router = express_1.default.Router();
router.get("/:address", (req, res, next) => {
    const address = req.params.address;
    if (!isValidAddressAddress(address)) {
        throw new Error("Please enter valid address");
    }
    db_1.default.transaction(async (tx) => {
        try {
            const contributions = await models.fetchContributions(address)(tx);
            res.send(contributions);
        }
        catch (e) {
            next(new Error(`Failed to fetch all contribution for the address: ${address}`, { cause: e }));
        }
    });
});
router.post("/", (req, res, next) => {
    // if (!req.isAuthenticated()) {
    //     res.status(401).end();
    // }
    try {
        validateContribution(req.body.contribution);
    }
    catch (e) {
        res.status(400).send({ message: e.message });
    }
    const { project_id, address, amount } = req.body.contribution;
    db_1.default.transaction(async (tx) => {
        try {
            const project = await models.insertContribution({
                project_id,
                address,
                amount
            })(tx);
            if (!project.id) {
                return next(new Error("Failed to insert contribution: `project_id` missing."));
            }
            // const pkg: ProjectPkg = {
            //     await models.fetchContributions(
            //         id,
            //         project_id,
            //         address,
            //         amount
            //     )(tx)
            // }
            res.status(201).send(project);
        }
        catch (cause) {
            next(new Error(`Failed to insert project.`, { cause: cause }));
        }
    });
});
const validateContribution = (contribution) => {
    if (!contribution) {
        throw new Error("Missing `contribution` entry.");
    }
    const entries = Object.entries(contribution);
    if (entries.filter(([_, v]) => {
        // undefined not allowed
        return v === void 0;
    }).length) {
        throw new Error(`Contribution entries can't have a value of \`undefined\`.`);
    }
};
const isValidAddressAddress = (address) => {
    try {
        encodeAddress(isHex(address)
            ? hexToU8a(address)
            : decodeAddress(address));
        return true;
    }
    catch (error) {
        return false;
    }
};
exports.default = router;
