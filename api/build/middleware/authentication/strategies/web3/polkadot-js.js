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
exports.polkadotJsAuthRouter = exports.polkadotJsStrategy = void 0;
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const util_crypto_1 = require("@polkadot/util-crypto");
const keyring_1 = require("@polkadot/keyring");
const util_1 = require("@polkadot/util");
const models_1 = require("../../../../models");
const db_1 = __importDefault(require("../../../../db"));
// @ts-ignore
const passportJwt = __importStar(require("passport-jwt"));
// @ts-ignore
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../../../config"));
const JwtStrategy = passportJwt.Strategy;
const cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies)
        token = req.cookies['access_token'];
    return token;
};
const jwtOptions = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: 'mysecretword'
};
// @ts-ignore
exports.polkadotJsStrategy = new JwtStrategy(jwtOptions, async function (jwt_payload, next) {
    const id = jwt_payload.id;
    try {
        const user = await db_1.default.select().from("users").where({ "id": Number(id) }).first();
        if (!user) {
            next(`No user found with id: ${id}`, false);
        }
        else {
            user.web3Accounts = await (0, db_1.default)("web3_accounts").select().where({
                user_id: user.id
            });
            return next(null, user);
        }
    }
    catch (e) {
        return next(`Failed to deserialize user with id ${id}`, false);
    }
});
/**
 * FIXME: move this to a more common location to be reused.
 */
const ensureParams = (record, next, params) => {
    try {
        for (let name of params) {
            if (!(record[name] && String(record[name]).trim())) {
                throw new Error(`Missing ${name} param.`);
            }
        }
    }
    catch (e) {
        next(e);
    }
};
exports.polkadotJsAuthRouter = express_1.default.Router();
exports.polkadotJsAuthRouter.post("/", (req, res, next) => {
    ensureParams(req.body, next, ["address", "meta", "type"]);
    ensureParams(req.body.meta, next, ["name", "source"]);
    const address = req.body.address.trim();
    try {
        (0, keyring_1.encodeAddress)((0, util_1.isHex)(address)
            ? (0, util_1.hexToU8a)(address)
            : (0, keyring_1.decodeAddress)(address));
    }
    catch (e) {
        const err = new Error("Invalid `address` param.", { cause: e });
        err.status = 400;
        next(err);
    }
    // If no address can be found, create a `users` and then a
    // `federated_credential`
    (0, models_1.getOrCreateFederatedUser)(req.body.meta.source, address, req.body.meta.name, async (err, user) => {
        if (err) {
            next(err);
        }
        if (!user) {
            next(new Error("No user provided."));
        }
        // create a `challenge` uuid and insert it into the users
        // table respond with the challenge
        db_1.default.transaction(async (tx) => {
            try {
                const challenge = (0, uuid_1.v4)();
                const [web3Account, isInsert] = await (0, models_1.upsertWeb3Challenge)(user, address, req.body.type, challenge)(tx);
                if (isInsert) {
                    res.status(201);
                }
                res.send({ user, web3Account });
            }
            catch (e) {
                await tx.rollback();
                next(new Error(`Unable to upsert web3 challenge for address: ${address}`, { cause: e }));
            }
        });
    });
});
exports.polkadotJsAuthRouter.post("/callback", (req, res, next) => {
    db_1.default.transaction(async (tx) => {
        try {
            const solution = req.body;
            const web3Account = await (0, models_1.fetchWeb3Account)(solution.address)(tx);
            if (!web3Account) {
                res.status(404);
            }
            else {
                const user = await (0, models_1.fetchUser)(web3Account.user_id)(tx);
                if (user?.id) {
                    if ((0, util_crypto_1.signatureVerify)(web3Account.challenge, solution.signature, solution.address).isValid) {
                        const payload = { id: user?.id };
                        const token = jsonwebtoken_1.default.sign(payload, jwtOptions.secretOrKey);
                        res.cookie("access_token", token, {
                            secure: config_1.default.environment !== "development",
                            httpOnly: true
                        });
                        res.send({ success: true });
                    }
                    else {
                        const challenge = (0, uuid_1.v4)();
                        const [web3Account, _] = await (0, models_1.upsertWeb3Challenge)(user, solution.address, solution.type, challenge)(tx);
                        /**
                         * FIXME: this sets the "WWW-Authenticate" header.
                         * Should we be running all of the auth calls
                         * through the same endpoint and responding with
                         * the "challenge" here, instead? Also, what form
                         * should this actually take?
                         */
                        next(`Imbue ${web3Account.challenge}`);
                    }
                }
                else {
                    res.status(404);
                }
            }
        }
        catch (e) {
            await tx.rollback();
            next(new Error(`Unable to finalise login`, { cause: e }));
        }
    });
});
