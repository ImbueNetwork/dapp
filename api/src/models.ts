import type { Knex } from "knex";
import db from "./db/index";


export type FederatedCredential = {
    id: number,
    issuer: string,
    subject: string,
};

export type Web3Account = {
    address: string,
    usr_id: number;
    type: string;
    challenge: string;
};

export type User = {
    id: number;
    display_name: string;
    web3Accounts: Web3Account[];
};

export type ProposedMilestone = {
    name: string;
    percentage_to_unlock: number;
};

export type GrantProposal = {
    name: string;
    logo: string;
    description: string;
    website: string;
    milestones: ProposedMilestone[];
    required_funds: number;
    owner?: string;
    usr_id?: number;
    category?: string | number;
};

export type Milestone = ProposedMilestone & {
    milestone_index: number;
    project_id: number | string;
    is_approved: boolean;
};

export type Project = {
    id?: string | number;
    name: string;
    logo: string;
    description: string;
    website: string;
    category?: string | number;
    required_funds: number;
    owner?: string;
    usr_id?: number;
};

export const fetchWeb3Account = (address: string) =>
    (tx: Knex.Transaction) =>
        tx<Web3Account>("web3_account")
            .select()
            .where({address,})
            .first();

export const fetchUser = (id: number) =>
    (tx: Knex.Transaction) =>
        tx<User>("usr").where({id}).first();

export const upsertWeb3Challenge = (
    user: User,
    address: string,
    type: string,
    challenge: string,
) => async (tx: Knex.Transaction):
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

export const insertUserByDisplayName = (displayName: string) =>
    async (tx: Knex.Transaction) => (
        await tx<User>("usr").insert({
            display_name: displayName
        }).returning("*")
    )[0];

export const insertProject = (project: Project) =>
    async (tx: Knex.Transaction) => (
        await tx<Project>("project").insert(project).returning("*")
    )[0];

export const updateProject = (id: string | number, project: Project) =>
    async (tx: Knex.Transaction) => (
        await tx<Project>("project")
            .update(project)
            .where({id})
            .returning("*")
    )[0];

export const fetchProject = (id: string | number) =>
    (tx: Knex.Transaction) => 
        tx<Project>("project").select().where({id}).first();

export const insertMilestones = (
    milestones: ProposedMilestone[],
    project_id: string | number,
) => {
    const values = milestones.map((m, idx) => ({
        ...m,
        project_id,
        milestone_index: idx,
    }));

    return (tx: Knex.Transaction) =>
        tx<Milestone>("milestone").insert(values).returning("*");
};

export const deleteMilestones = (project_id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<Milestone>("milestone").delete().where({project_id});

export const fetchProjectMilestones = (id: string | number) =>
    (tx: Knex.Transaction) => 
        tx<Milestone>("milestone").select().where({project_id: id});

export const insertFederatedCredential = (
    id: number,
    issuer: string,
    subject: string,
) => async (tx: Knex.Transaction) => (
    await tx<FederatedCredential>("federated_credential").insert({
        id, issuer, subject
    }).returning("*")
)[0];

export const getOrCreateFederatedUser = (
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
                user = await insertUserByDisplayName(displayName)(tx);
                await insertFederatedCredential(user.id, issuer, subject)(tx);
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
                "Failed to upsert federated authentication.",
                {cause: err as Error}
            ));
        }
    });
};

