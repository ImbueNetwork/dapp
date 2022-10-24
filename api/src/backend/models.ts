import type { Knex } from "knex";
import db from "./db/index";


export type FederatedCredential = {
    id: number,
    issuer: string,
    subject: string,
};

export type Web3Account = {
    address: string,
    user_id: number;
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
    user_id?: number;
    category?: string | number;
    currency_id: number;
    chain_project_id?: number;
};

export type Milestone = ProposedMilestone & {
    milestone_index: number;
    project_id: number | string;
    is_approved: boolean;
};

export type MilestoneDetails = {
    index: number | string;
    project_id: number | string;
    details: string;
}

export type Project = {
    id?: string | number;
    name: string;
    logo: string;
    description: string;
    website: string;
    category?: string | number;
    chain_project_id?: number;
    required_funds: number;
    currency_id: number;
    owner?: string;
    user_id?: string | number;
};

export type ProjectProperties = {
    id?: string | number;
    faq: string;
    project_id?: string | number;
};

export const fetchWeb3Account = (address: string) =>
    (tx: Knex.Transaction) =>
        tx<Web3Account>("web3_accounts")
            .select()
            .where({ address, })
            .first();

export const fetchUser = (id: number) =>
    (tx: Knex.Transaction) =>
        tx<User>("users").where({ id }).first();



export const upsertWeb3Challenge = (
    user: User,
    address: string,
    type: string,
    challenge: string,
) => async (tx: Knex.Transaction):
        Promise<[web3Account: Web3Account, isInsert: boolean]> => {

        let web3Account = await tx<Web3Account>("web3_accounts")
            .select()
            .where({
                user_id: user?.id
            })
            .first();

        if (!web3Account) {
            return [
                (
                    await tx<Web3Account>("web3_accounts").insert({
                        address,
                        user_id: user.id,
                        type,
                        challenge,
                    }).returning("*")
                )[0],
                true
            ];
        }

        return [
            (
                await tx<Web3Account>("web3_accounts").update({ challenge }).where(
                    { user_id: user.id }
                ).returning("*")
            )[0],
            false
        ];
    };

export const insertUserByDisplayName = (displayName: string) =>
    async (tx: Knex.Transaction) => (
        await tx<User>("users").insert({
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

export const updateProjectProperties = (id: string | number, properties: ProjectProperties) =>
    async (tx: Knex.Transaction) => (
        await tx<ProjectProperties>("project_properties")
            .update(properties)
            .where({ 'project_id': id })
            .returning("*")
    )[0];

export const fetchProject = (id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<Project>("projects").select().where({ id }).first();


export const fetchProjectWithProperties = (id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<Project>("projects").join("project_properties", "projects.id", "=", "project_properties.project_id").select().where({ "project_id": id }).first();

export const fetchAllProjects = () =>
    (tx: Knex.Transaction) =>
        tx<Project>("projects").whereNotNull('chain_project_id').select();

export const fetchUserProject = (id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<Project>("projects").select().where({
            user_id: id
        }).first();

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

export const updateMilestoneDetails = (id: string | number, milestoneId: string | number, details: string) => (tx: Knex.Transaction) =>
        tx<MilestoneDetails>("milestone_details").where({ project_id: id}).where('index', '=', milestoneId).update('details',details).returning("*");


export const insertMilestoneDetails = (value:MilestoneDetails) => async (tx: Knex.Transaction) => (await
    tx<MilestoneDetails>("milestone_details").insert(value).returning("*"))[0];

export const fetchAllMilestone = (id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<MilestoneDetails>("milestone_details").where('project_id','=',id);

export const insertFederatedCredential = (
    id: number,
    issuer: string,
    subject: string,
) => async (tx: Knex.Transaction) => (
    await tx<FederatedCredential>("federated_credentials").insert({
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
            const federated = await tx<FederatedCredential>("federated_credentials").select().where({
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
                const user_ = await db.select().from<User>("users").where({
                    id: federated.id
                }).first();

                if (!user_) {
                    throw new Error(
                        `Unable to find matching user by \`federated_credential.id\`: ${federated.id
                        }`
                    );
                }
                user = user_;
            }

            done(null, user);
        } catch (err) {
            done(new Error(
                "Failed to upsert federated authentication." 
            ));
        }
    });
};

