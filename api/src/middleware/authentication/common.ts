import type { Knex } from "knex";
import db from "../../db/index";


export type FederatedCredential = {
    id: number,
    issuer: string,
    subject: string,
};

export type User = {
    id: number;
    display_name: string;
    email: string;
};

export type Web3Account = {
    address: string,
    usr_id: number;
    type: string;
    challenge: string;
};

export const fetchWeb3Account = (address: string, tx?: Knex.Transaction) => {
    const run = async (tx: Knex.Transaction) => {
        return await tx<Web3Account>("web3_account").select().where({
            address,
        }).first();
    };
    if (!tx) {
        return db.transaction(run);
    }
    return run(tx);
};

export const fetchUser = (id: number, tx?: Knex.Transaction) => {
    const run = async (tx: Knex.Transaction) => {
        return await tx<User>("usr").where({id}).first();
    };
    if (!tx) {
        return db.transaction(run);
    }
    return run(tx);
};

export const upsertWeb3Challenge = async (
    user: User,
    address: string,
    type: string,
    challenge: string,
    tx?: Knex.Transaction,
) => {
    const run = async (tx: Knex.Transaction):
        Promise<[web3Account: Web3Account, isInsert: boolean]> => {
        let web3Account = await tx<Web3Account>("web3_account")
            .select()
            .where({
                usr_id: user.id
            })
            .first();

        if (!web3Account) {
            return [
                (
                    await tx<Web3Account>("web3_account").insert({
                        address,
                        usr_id: user.id,
                        type,
                        challenge,
                    }).returning("*")
                )[0],
                true
            ];
        }
        
        return [
            (
                await tx<Web3Account>("web3_account").update({challenge}).where(
                    {usr_id: user.id}
                ).returning("*")
            )[0],
            false
        ];
    };

    if (!tx) {
        return db.transaction(run);
    }
    return run(tx);
}

export const insertUserByDisplayName = async (displayName: string, tx?: Knex.Transaction) => {
    const run = async (tx: Knex.Transaction) => (
        await tx<User>("usr").insert({
            display_name: displayName
        }).returning("*")
    )[0];

    if (!tx) {
        return await db.transaction(run);
    }
    return run(tx);
};

export const insertFederatedCredential = async (id: number, issuer: string, subject: string, tx?: Knex.Transaction) => {
    const run = async (tx: Knex.Transaction) => (
        await tx<FederatedCredential>("federated_credential").insert({
            id, issuer, subject
        }).returning("*")
    )[0];

    if (!tx) {
        return await db.transaction(run);
    }
    return run(tx);
}

export const upsertFederated = (
    issuer: string,
    subject: string,
    displayName: string,
    done: CallableFunction
) => {
    db.transaction(async tx => {
        let user: User;

        try {
            /**
             * Do we already have a federated_credential ?
             */
            const federated = await tx<FederatedCredential>("federated_credential").select().where({
                issuer,
                subject,
            }).first();
    
            /**
             * If not, create the `usr`, then the `federated_credential`
             */
            if (!federated) {
                // FIXME: do these in a tx
                user = await insertUserByDisplayName(displayName, tx);
                await insertFederatedCredential(user.id, issuer, subject, tx);
            } else {
                const user_ = await db.select().from<User>("usr").where({
                    id: federated.id
                }).first();
    
                if (!user_) {
                    throw new Error(
                        `Unable to find matching user by \`federated_credential.id\`: ${
                            federated.id
                        }`
                    );
                }
                user = user_;
            }
    
            done(null, user);
        } catch (err) {
            await tx.rollback();
            done(new Error(
                "Failed to upsert federated authentication.",
                {cause: err as Error}
            ));
        }
    });
};

