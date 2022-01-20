import express from "express";
import { v4 as uuid } from "uuid";
import passport from "passport";
import { signatureVerify } from "@polkadot/util-crypto";


import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { hexToU8a, isHex } from '@polkadot/util';

import {
    fetchUser,
    fetchWeb3Account,
    upsertWeb3Challenge,
    User,
    upsertFederated
} from "../../common";
import db from "../../../../db";
import { Strategy } from "passport-google-oauth20";


type Solution = {
    signature: string;
    address: string;
};

export class Web3Strategy extends passport.Strategy {
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    authenticate(
        req: express.Request<Record<string,any>>,
        opts?: Record<string,any>
    ) {
        db.transaction(async tx => {
            try {
                const solution: Solution = req.body;
                const web3Account = await fetchWeb3Account(
                    solution.address, tx
                );

                if (!web3Account) {
                    this.fail();
                } else {
                    const user = await fetchUser(web3Account.usr_id, tx);
                    if (user) {
                        if (
                            signatureVerify(
                                web3Account.challenge,
                                solution.signature,
                                solution.address
                            ).isValid
                        ) {
                            this.success(user);
                        } else {
                            const challenge = uuid();
                            const [web3Account, _] = await upsertWeb3Challenge(
                                user,
                                req.body.address,
                                req.body.type,
                                challenge
                            );

                            /**
                             * FIXME: this sets the "WWW-Authenticate" header.
                             * Should we be running all of the auth calls
                             * through the same endpoint and responding with
                             * the "challenge" here, instead? Also, what form
                             * should this actually take?
                             */
                            this.fail(`Imbue ${web3Account.challenge}`);
                        }
                    } else {
                        this.fail();
                    }
                }
            } catch (e) {
                await tx.rollback();
                this.error(e);
            }
        });
    }
}

/**
 * FIXME: move this to a more common location to be reused.
 */
const ensureParams = (
    record: Record<string,any>,
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


export const polkadotjsStrategy = new Web3Strategy("polkadot-js");
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
 
    // If no address can be found, create a `usr` and then a
    // `federated_credential`
    upsertFederated(
        req.body.meta.source,
        address,
        req.body.meta.name,
        async (err: Error, user: User) => {
            if (err) {
                next(err);
            }

            try {
                // create a `challenge` uuid and insert it into the usr
                // table respond with the challenge
                const challenge = uuid();
                const [web3Account, isInsert] = await upsertWeb3Challenge(
                    user, address, req.body.type, challenge
                );
                
                if (isInsert) {
                    res.status(201);
                }
                res.send({user, web3Account});
            } catch (e) {
                next(e);
            }
        }
    );
});

polkadotJsAuthRouter.post(
    "/callback",
    passport.authenticate("polkadot-js"),
    (
        req: express.Request,
        res: express.Response,
    ) => {
            res.send({success: true});
    }
);
