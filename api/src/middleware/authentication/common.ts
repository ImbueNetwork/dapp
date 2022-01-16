import db from "../../db";


export type FederatedCredential = {
    id: number,
    issuer: string,
    subject: string,
};

export type User = {
    id: number;
    display_name: string;
    web3_account_id: string;
    email: string;
};

export const insertUserByDisplayName = async (displayName: string) => {
    return (
        await db.insert({
            display_name: displayName
        }).into<User>("usr").returning("*")
    )[0];
};

export const insertFederatedCredential = async (id: number, issuer: string, subject: string) => {
    return (
        await db.insert({id, issuer, subject}).into<FederatedCredential>(
            "federated_credential"
        ).returning("*")
    )[0];
}

export const verifyOIDC = async (
    issuer: string,
    subject: string,
    displayName: string,
    done: CallableFunction
) => {
    let user: User;

    try {
        /**
         * Do we already have a federated_credential ?
         */
        const federated = await db.select().from<FederatedCredential>("federated_credential").where({
            issuer,
            subject,
        }).first();

        /**
         * If not, create the `usr`, then the `federated_credential`
         */
        if (!federated) {
            user = await insertUserByDisplayName(displayName);
            await insertFederatedCredential(user.id, issuer, subject);
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
        done(new Error(
            "Failed to `verify` via Google OIDC authentication.",
            {cause: err as Error})
        );
    }
};

