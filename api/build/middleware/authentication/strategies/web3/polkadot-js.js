"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.polkadotJsAuthRouter = exports.polkadotJsStrategy = exports.Web3Strategy = void 0;
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const passport_1 = __importDefault(require("passport"));
const util_crypto_1 = require("@polkadot/util-crypto");
const keyring_1 = require("@polkadot/keyring");
const util_1 = require("@polkadot/util");
const models_1 = require("../../../../models");
const db_1 = __importDefault(require("../../../../db"));
class Web3Strategy extends passport_1.default.Strategy {
    name;
    constructor(name) {
        super();
        this.name = name;
    }
    authenticate(req, _opts) {
        db_1.default.transaction(async (tx) => {
            try {
                const solution = req.body;
                const web3Account = await (0, models_1.fetchWeb3Account)(solution.address)(tx);
                if (!web3Account) {
                    this.fail();
                }
                else {
                    const user = await (0, models_1.fetchUser)(web3Account.user_id)(tx);
                    if (user?.id) {
                        if ((0, util_crypto_1.signatureVerify)(web3Account.challenge, solution.signature, solution.address).isValid) {
                            this.success(user);
                        }
                        else {
                            const challenge = (0, uuid_1.v4)();
                            const [web3Account, _] = await (0, models_1.upsertWeb3Challenge)(user, req.body.address, req.body.type, challenge)(tx);
                            /**
                             * FIXME: this sets the "WWW-Authenticate" header.
                             * Should we be running all of the auth calls
                             * through the same endpoint and responding with
                             * the "challenge" here, instead? Also, what form
                             * should this actually take?
                             */
                            this.fail(`Imbue ${web3Account.challenge}`);
                        }
                    }
                    else {
                        this.fail();
                    }
                }
            }
            catch (e) {
                await tx.rollback();
                this.error(e);
            }
        });
    }
}
exports.Web3Strategy = Web3Strategy;
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
exports.polkadotJsStrategy = new Web3Strategy("polkadot-js");
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
exports.polkadotJsAuthRouter.post("/callback", passport_1.default.authenticate("polkadot-js"), (_req, res) => {
    res.send({ success: true });
});
