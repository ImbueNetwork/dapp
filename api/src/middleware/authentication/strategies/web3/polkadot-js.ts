import express from "express";
import {v4 as uuid} from "uuid";
import passport from "passport";

import {signatureVerify} from "@polkadot/util-crypto";

import {decodeAddress, encodeAddress} from "@polkadot/keyring";
import {hexToU8a, isHex} from '@polkadot/util';

import {fetchUser, fetchWeb3Account, getOrCreateFederatedUser, upsertWeb3Challenge, User} from "../../../../models";
import db from "../../../../db";


// @ts-ignore
import * as passportJwt from "passport-jwt"
// @ts-ignore
import jwt from 'jsonwebtoken';

const JwtStrategy = passportJwt.Strategy;

type Solution = {
    signature: string;
    address: string;
    type: string;
};

const cookieExtractor = function(req: any) {
    let token: any | null = null;
    if (req && req.cookies) token = req.cookies['access_token'];
    return token;
};

const jwtOptions = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: 'mysecretword'
};

// @ts-ignore
export const polkadotJsStrategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    next(null, {});
});

/**
 * FIXME: move this to a more common location to be reused.
 */
const ensureParams = (
    record: Record<string, any>,
    next: CallableFunction,
    params: string[]
) => {
    try {
        for (let name of params) {
            if (!(record[name] && String(record[name]).trim())) {
                throw new Error(`Missing ${name} param.`);
            }
        }
    } catch (e) {
        next(e);
    }
}

export const polkadotJsAuthRouter = express.Router();

polkadotJsAuthRouter.post("/", (req, res, next) => {
    ensureParams(req.body, next, ["address", "meta", "type"]);
    ensureParams(req.body.meta, next, ["name", "source"]);

    const address = req.body.address.trim();

    try {
        encodeAddress(
            isHex(address)
                ? hexToU8a(address)
                : decodeAddress(address)
        );
    } catch (e) {
        const err = new Error(
            "Invalid `address` param.",
            {cause: e as Error}
        );
        (err as any).status = 400;
        next(err);
    }

    // If no address can be found, create a `users` and then a
    // `federated_credential`
    getOrCreateFederatedUser(
        req.body.meta.source,
        address,
        req.body.meta.name,
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
                        user, address, req.body.type, challenge
                    )(tx);

                    if (isInsert) {
                        res.status(201);
                    }

                    res.send({user, web3Account});
                } catch (e) {
                    await tx.rollback();
                    next(new Error(
                        `Unable to upsert web3 challenge for address: ${address}`,
                        {cause: e as Error}
                    ));
                }
            });
        }
    );
});

polkadotJsAuthRouter.post(
    "/callback",
    (req, res, next) => {
        db.transaction(async tx => {
            try {
                const solution: Solution = req.body;
                const web3Account = await fetchWeb3Account(
                    solution.address
                )(tx);

                if (!web3Account) {
                    res.status(404);
                } else {
                    const user = await fetchUser(web3Account.user_id)(tx);
                    if (user?.id) {
                        if (signatureVerify(web3Account.challenge, solution.signature, solution.address).isValid) {
                            const payload = {id: user?.id};
                            const token = jwt.sign(payload, jwtOptions.secretOrKey);

                            console.log(`sent: ${res.headersSent}`);
                            res.cookie("access_token", token);
                            res.send({success: true});
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
                    {cause: e as Error}
                ));
            }
        });
    }
);
