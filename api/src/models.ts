import type { Knex } from "knex";
import db from "./db/index";


export type FederatedCredential = {
    id: number,
    issuer: string,
    subject: string,
};

export type Web3Account = {
    address: string,
    imbuer_id: number;
    type: string;
    challenge: string;
};

export type Imbuer = {
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
    imbuer_id?: number;
    category?: string | number;
    chain_project_id?: number;
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
    chain_project_id?: number;
    required_funds: number;
    owner?: string;
    imbuer_id?: string | number;
};

export const fetchWeb3Account = (address: string) =>
    (tx: Knex.Transaction) =>
        tx<Web3Account>("web3_account")
            .select()
            .where({ address, })
            .first();

export const fetchImbuer = (id: number) =>
    (tx: Knex.Transaction) =>
        tx<Imbuer>("imbuer").where({ id }).first();



export const upsertWeb3Challenge = (
    imbuer: Imbuer,
    address: string,
    type: string,
    challenge: string,
) => async (tx: Knex.Transaction):
        Promise<[web3Account: Web3Account, isInsert: boolean]> => {

        let web3Account = await tx<Web3Account>("web3_account")
            .select()
            .where({
                imbuer_id: imbuer?.id
            })
            .first();

        if (!web3Account) {
            return [
                (
                    await tx<Web3Account>("web3_account").insert({
                        address,
                        imbuer_id: imbuer.id,
                        type,
                        challenge,
                    }).returning("*")
                )[0],
                true
            ];
        }

        return [
            (
                await tx<Web3Account>("web3_account").update({ challenge }).where(
                    { imbuer_id: imbuer.id }
                ).returning("*")
            )[0],
            false
        ];
    };

export const insertImbuerByDisplayName = (displayName: string) =>
    async (tx: Knex.Transaction) => (
        await tx<Imbuer>("imbuer").insert({
            display_name: displayName
        }).returning("*")
    )[0];

export const insertProject = (project: Project) =>
    async (tx: Knex.Transaction) => (
        await tx<Project>("projects").insert(project).returning("*")
    )[0];

export const updateProject = (id: string | number, project: Project) =>
    async (tx: Knex.Transaction) => (
        await tx<Project>("projects")
            .update(project)
            .where({ id })
            .returning("*")
    )[0];

export const fetchProject = (id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<Project>("projects").select().where({ id }).first();

export const fetchAllProjects = () =>
    (tx: Knex.Transaction) =>
        tx<Project>("projects").select();

export const fetchImbuerProjects = (id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<Project>("projects").select().where({
            imbuer_id: id
        }).select();


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
        tx<Milestone>("milestones").insert(values).returning("*");
};

export const deleteMilestones = (project_id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<Milestone>("milestones").delete().where({ project_id });

export const fetchProjectMilestones = (id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<Milestone>("milestones").select().where({ project_id: id });

export const insertFederatedCredential = (
    id: number,
    issuer: string,
    subject: string,
) => async (tx: Knex.Transaction) => (
    await tx<FederatedCredential>("federated_credentials").insert({
        id, issuer, subject
    }).returning("*")
)[0];

export const getOrCreateFederatedImbuer = (
    issuer: string,
    subject: string,
    displayName: string,
    done: CallableFunction
) => {
    db.transaction(async tx => {
        let imbuer: Imbuer;

        try {
            /**
             * Do we already have a federated_credential ?
             */
            const federated = await tx<FederatedCredential>("federated_credentials").select().where({
                issuer,
                subject,
            }).first();

            /**
             * If not, create the `imbuer`, then the `federated_credential`
             */
            if (!federated) {
                imbuer = await insertImbuerByDisplayName(displayName)(tx);
                await insertFederatedCredential(imbuer.id, issuer, subject)(tx);
            } else {
                const imbuer_ = await db.select().from<Imbuer>("imbuer").where({
                    id: federated.id
                }).first();

                if (!imbuer_) {
                    throw new Error(
                        `Unable to find matching imbuer by \`federated_credential.id\`: ${
                            federated.id
                        }`
                    );
                }
                imbuer = imbuer_;
            }

            done(null, imbuer);
        } catch (err) {
            done(new Error(
                "Failed to upsert federated authentication.",
                { cause: err as Error }
            ));
        }
    });
};

