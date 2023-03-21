import express from "express";
import { v4 as uuid } from "uuid";

import { signatureVerify } from "@polkadot/util-crypto";

import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { hexToU8a, isHex } from '@polkadot/util';
import { ensureParams, cookieExtractor, jwtOptions, verifyUserIdFromJwt } from "../common"
import {
    fetchUser,
    fetchWeb3AccountByAddress,
    fetchWeb3AccountsByUserId,
    getOrCreateFederatedUser,
    updateOrInsertUserWeb3Address,
    upsertWeb3Challenge,
    User,
    Web3Account
} from "../../../../models";
import db from "../../../../db";

// @ts-ignore
import * as passportJwt from "passport-jwt"
// @ts-ignore
import jwt from 'jsonwebtoken';
import config from "../../../../config";

const JwtStrategy = passportJwt.Strategy;

type Solution = {
    signature: string;
    address: string;
    type: string;
};


// @ts-ignore
export const polkadotJsStrategy = new JwtStrategy(jwtOptions, async function (jwt_payload, next) {
    const id = jwt_payload.id;

    try {
        db.transaction(async tx => {
            const user = await fetchUser(id)(tx);
            if (!user) {
                next(`No user found with id: ${id}`, false);
            } else {
                user.web3Accounts = await fetchWeb3AccountsByUserId(id)(tx);
                return next(null, user);
            }
        });
    } catch (e) {
        return next(`Failed to deserialize user with id ${id}`, false);
    }
});


export const polkadotJsAuthRouter = express.Router();

polkadotJsAuthRouter.post("/", async (req, res, next) => {
    ensureParams(req.body.account, next, ["address", "meta", "type"]);
    ensureParams(req.body.account.meta, next, ["name", "source"]);
    const account = req.body.account;
    const existingUser = req.body.existing_user;
    const address = account.address.trim();
    if (existingUser) {
        verifyUserIdFromJwt(req, res, next, existingUser.id);
        db.transaction(async tx => {
            const challenge = uuid();
            const [web3Account, isInsert] = await updateOrInsertUserWeb3Address(
                existingUser, address, account.type, challenge
            )(tx);
            res.send({ existingUser, web3Account });
        });

    } else {
        try {
            encodeAddress(
                isHex(address)
                    ? hexToU8a(address)
                    : decodeAddress(address)
            );
        } catch (e) {
            const err = new Error(
                "Invalid `address` param.",
                { cause: e as Error }
            );
            (err as any).status = 400;
            next(err);
        }
        // If no address can be found, create a `users` and then a
        // `federated_credential`
        getOrCreateFederatedUser(
            account.meta.source,
            address,
            account.meta.name,
            async (err: Error, user: User) => {
                if (err) {
                    next(err);
                }

                if (!user) {
                    next(new Error("No user provided."));
                }

                // create a `challenge` uuid and insert it into the users
                // table respond with the challenge
                db.transaction(async tx => {
                    try {
                        const challenge = uuid();
                        const [web3Account, isInsert] = await upsertWeb3Challenge(
                            user, address, account.type, challenge
                        )(tx);

                        if (isInsert) {
                            res.status(201);
                        }

                        res.send({ user, web3Account });
                    } catch (e) {
                        await tx.rollback();
                        next(new Error(
                            `Unable to upsert web3 challenge for address: ${address}`,
                            { cause: e as Error }
                        ));
                    }
                });
            }
        );
    }
});

polkadotJsAuthRouter.post(
    "/callback",
    (req, res, next) => {
        db.transaction(async tx => {
            try {
                const solution: Solution = req.body;
                const web3Account = await fetchWeb3AccountByAddress(
                    solution.address
                )(tx);

                if (!web3Account) {
                    res.status(404);
                } else {
                    const user = await fetchUser(web3Account.user_id)(tx);
                    if (user?.id) {
                        if (signatureVerify(web3Account.challenge, solution.signature, solution.address).isValid) {
                            const payload = { id: user?.id };
                            const token = jwt.sign(payload, jwtOptions.secretOrKey);

                            res.cookie("access_token", token, {
                                secure: config.environment !== "development",
                                httpOnly: true
                            });

                            res.send({ success: true });
                        } else {
                            const challenge = uuid();
                            const [web3Account, _] = await upsertWeb3Challenge(
                                user,
                                solution.address,
                                solution.type,
                                challenge
                            )(tx);

                            /**
                             * FIXME: this sets the "WWW-Authenticate" header.
                             * Should we be running all of the auth calls
                             * through the same endpoint and responding with
                             * the "challenge" here, instead? Also, what form
                             * should this actually take?
                             */
                            next(`Imbue ${web3Account.challenge}`);
                        }
                    } else {
                        res.status(404);
                    }
                }
            } catch (e) {
                await tx.rollback();
                next(new Error(
                    `Unable to finalise login`,
                    { cause: e as Error }
                ));
            }
        });
    }
);
