import { knex, Knex } from "knex";
import db from "./db/index";
import { StreamChat } from 'stream-chat';

export type FederatedCredential = {
    id: number,
    issuer: string,
    subject: string,
};

export type Skill = {
    id: number,
    name: string
}

export type Industry = {
    id: number,
    name: string
}

export type Language = {
    id: number,
    name: string
}

export type Service = {
    id: number,
    name: string
}

export enum ProjectStatus {
    Draft = 0,
    PendingReview = 1,
    ChangesRequested = 2,
    Rejected = 3,
    Accepted = 4,
}

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
    username: string;
    email: string;
    password: string;
    briefs_submitted: number;
    getstream_token: string;
};

export type ProposedMilestone = {
    name: string;
    percentage_to_unlock: number;
    amount: number;
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
    brief_id?: string | number;
    total_cost_without_fee?: number;
    imbue_fee?: number;
    status_id?: number;
};

export type ProjectProperties = {
    id?: string | number;
    faq: string;
    project_id?: string | number;
};

// created_by: string;
// hours_per_week: number,
// briefs_submitted_by: number,
export type Brief = {
    id?: string | number;
    headline: string;
    industry_ids: number[];
    industries: string[];
    description: string;
    skill_ids: number[];
    skills: string[];
    scope_id: number;
    scope_level: string;
    duration_id: number;
    duration: string;
    budget: bigint;
    experience_level: string,
    experience_id: number
    user_id: number;
    project_id: number;
};

export type Freelancer = {
    id: string | number;
    bio: string;
    education: string;
    experience: string;
    facebook_link: string;
    twitter_link: string;
    telegram_link: string;
    discord_link: string;
    freelanced_before: string;
    freelancing_goal: string;
    work_type: string;
    title: string;
    skills: string[];
    languages: string[];
    services: string[];
    clients: string[];
    client_images: string[];
    display_name: string;
    username: string;
    user_id: number;
    rating?: number;
    num_ratings: number;
};


export type BriefSqlFilter = {
    experience_range: number[];
    submitted_range: number[];
    submitted_is_max: boolean;
    length_range: number[];
    length_is_max: boolean;
    search_input: string;
};

export type FreelancerSqlFilter = {
    skills_range: Array<number>;
    services_range: Array<number>;
    languages_range: Array<number>;
    search_input: string;
};

export const fetchWeb3AccountByAddress = (address: string) =>
    (tx: Knex.Transaction) =>
        fetchAllWeb3Account()(tx)
            .where({ address })
            .first();

export const fetchAllWeb3Account = () =>
    (tx: Knex.Transaction) =>
        tx<Web3Account>("web3_accounts")
            .select();

export const fetchWeb3AccountByUserId = (user_id: number) =>
    (tx: Knex.Transaction) =>
        fetchAllWeb3Account()(tx)
            .where({ user_id })
            .first();

export const fetchWeb3AccountsByUserId = (user_id: number) =>
    (tx: Knex.Transaction) =>
        fetchAllWeb3Account()(tx)
            .where({ user_id })
            .select();

export const fetchUser = (id: number) =>
    (tx: Knex.Transaction) =>
        tx<User>("users").where({ id }).first();

export const fetchUserOrEmail = (userOrEmail: string) =>
    (tx: Knex.Transaction) =>
        tx<User>("users").where({ username: userOrEmail })
            .orWhere({ email: userOrEmail.toLowerCase() })
            .first()
            .debug(true);

export const upsertWeb3Challenge = (
    user: User,
    address: string,
    type: string,
    challenge: string,
) => async (tx: Knex.Transaction):
        Promise<[web3Account: Web3Account, isInsert: boolean]> => {

        const web3Account = await tx<Web3Account>("web3_accounts")
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

export const updateOrInsertUserWeb3Address = (
    user: User,
    address: string,
    type: string,
    challenge: string,
) => async (tx: Knex.Transaction):
        Promise<[web3Account: Web3Account, isInsert: boolean]> => {
        const web3Account = await tx<Web3Account>("web3_accounts")
            .select()
            .where({
                user_id: user?.id
            }).
            orWhere({ address })
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
                await tx<Web3Account>("web3_accounts").update({ user_id: user.id, address })
                    .where({ user_id: user.id })
                    .orWhere({ address })
                    .returning("*")
            )[0],
            false
        ];
    };

export const insertUserByDisplayName = (displayName: string, username: string) =>
    async (tx: Knex.Transaction) => (
        await tx<User>("users").insert({
            display_name: displayName,
            username: username,
        }).returning("*")
    )[0];

export const generateGetStreamToken = async (user: User) => {
    if (process.env.GETSTREAM_API_KEY && process.env.GETSTREAM_SECRET_KEY) {
        const client: StreamChat = new StreamChat(process.env.GETSTREAM_API_KEY, process.env.GETSTREAM_SECRET_KEY);
        const token = client.createToken(user.username);
        await client.upsertUser({ id: user.username });
        return token;
    }
    return ""
}

export const updateUserGetStreamToken = (id: number, token: string) =>
    async (tx: Knex.Transaction) => (
        await tx<User>("users").where({ id }).update({
            getstream_token: token
        }).returning("*")
    )[0];

export const insertToTable = <T>(item: string, table_name: string) =>
    async (tx: Knex.Transaction) => (
        await tx(table_name).insert({
            name: item.toLowerCase()
        }).returning("*")
    )[0];

export const updateFederatedLoginUser = (user: User, username: string, email: string, password: string) =>
    async (tx: Knex.Transaction) => (
        await tx<User>("users").update({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: password
        }).where({
            id: user.id
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


export const fetchUserBriefApplications = (user_id: string | number, brief_id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<Project>("projects").select().where({ user_id, brief_id }).first();

export const fetchProject = (id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<Project>("projects").select().where({ "id": id }).first();

export const acceptBriefApplication = (id: string | number, project_id: number) =>
    async (tx: Knex.Transaction) => (
        await tx<Brief>("briefs").update({
            "project_id": project_id,
        }).where({
            id
        }).returning("*")
    )[0];

export const fetchProjectWithProperties = (id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<Project>("projects").join("project_properties", "projects.id", "=", "project_properties.project_id").select().where({ "project_id": id }).first();

export const fetchAllProjects = () =>
    (tx: Knex.Transaction) =>
        tx("projects").select();

export const fetchUserProject = (id: string | number) =>
    (tx: Knex.Transaction) =>
        fetchAllProjects()(tx)
        .where({ "id": id })
        .first()

export const fetchUserProjects = (id: string | number) =>
    (tx: Knex.Transaction) =>
        fetchAllProjects()(tx)
        .where({ "user_id": id })

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
    tx<MilestoneDetails>("milestone_details").where({ project_id: id }).where('index', '=', milestoneId).update('details', details).returning("*");

export const insertMilestoneDetails = (value: MilestoneDetails) => async (tx: Knex.Transaction) => (await
    tx<MilestoneDetails>("milestone_details").insert(value).returning("*"))[0];

export const fetchAllMilestone = (id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<MilestoneDetails>("milestone_details").where('project_id', '=', id);

export const fetchMilestoneByIndex = (projectId: string | number, milestoneId: string | number) =>
    (tx: Knex.Transaction) =>
        tx<MilestoneDetails>("milestone_details").select().where({ project_id: projectId }).where('index', '=', milestoneId);

export const fetchBriefApplications = (id: string) =>
    (tx: Knex.Transaction) =>
        fetchAllProjects()(tx)
            .where({ "brief_id": id })
            .select()

export const fetchBriefProjects = (brief_id: string) =>
    (tx: Knex.Transaction) =>
        fetchAllProjects()(tx)
            .where({ brief_id })
            .select()

export const fetchAcceptedBriefs = (user_id: string) =>
    (tx: Knex.Transaction) =>
        fetchAllBriefs()(tx)
            .where({ user_id })
            .select()

export const fetchBrief = (id: string) =>
    (tx: Knex.Transaction) =>
        fetchAllBriefs()(tx)
            .where({ "briefs.id": id })
            .first()


export const fetchUserBriefs = (user_id: string) =>
    (tx: Knex.Transaction) =>
        fetchAllBriefs()(tx)
            .where({ user_id })
            .select()

export const fetchAllBriefs = () =>
    (tx: Knex.Transaction) =>
        tx.select(
            "briefs.id",
            "headline",
            "description",
            "scope.scope_level",
            "briefs.scope_id",
            "duration.duration",
            "briefs.duration_id",
            "budget",
            "users.display_name as created_by",
            "experience_level",
            "briefs.experience_id",
            "briefs.created",
            "briefs.user_id",
            "briefs.project_id",
            "users.briefs_submitted as number_of_briefs_submitted",
            tx.raw("ARRAY_AGG(DISTINCT CAST(skills.name as text)) as skills"),
            tx.raw("ARRAY_AGG(DISTINCT CAST(skills.id as text)) as skill_ids"),
            tx.raw("ARRAY_AGG(DISTINCT CAST(industries.name as text)) as industries"),
            tx.raw("ARRAY_AGG(DISTINCT CAST(industries.id as text)) as industry_ids"),
        )
            .from("briefs")
            .leftJoin("brief_industries", { "briefs.id": "brief_industries.brief_id" })
            .leftJoin("industries", { "brief_industries.industry_id": "industries.id" })
            .leftJoin("brief_skills", { "briefs.id": "brief_skills.brief_id" })
            .leftJoin("skills", { "brief_skills.skill_id": "skills.id" })
            .leftJoin("experience", { 'briefs.experience_id': "experience.id" })
            .leftJoin("scope", { "briefs.scope_id": "scope.id" })
            .leftJoin("duration", { "briefs.duration_id": "duration.id" })
            .innerJoin("users", { "briefs.user_id": "users.id" })
            .orderBy("briefs.created", "desc")
            .groupBy("briefs.id")
            .groupBy("scope.scope_level")
            .groupBy("duration.duration")
            .groupBy("users.display_name")
            .groupBy("briefs.experience_id")
            .groupBy("experience.experience_level")
            .groupBy("users.id")

export const fetchItems = (ids: number[], tableName: string) =>
    async (tx: Knex.Transaction) =>
        tx(tableName).select("id", "name")
            .whereIn(`id`, ids);

// export const fetchSkills = (ids: string[]) =>
//     (tx: Knex.Transaction) =>
//         tx<Skill>("skills").select("id","name").whereIn('id', ids );

// Insert a brief and their respective skill and industry_ids.
export const insertBrief = (brief: Brief, skill_ids: number[], industry_ids: number[], scope_id: number, duration_id: number) =>
    async (tx: Knex.Transaction) => (
        await tx("briefs").insert({
            headline: brief.headline,
            description: brief.description,
            duration_id: duration_id,
            scope_id: scope_id,
            user_id: brief.user_id,
            budget: brief.budget,
            experience_id: brief.experience_id,
        }).returning("briefs.id")
            .then(async (ids) => {
                if (skill_ids) {
                    skill_ids.forEach(async (skillId) => {
                        if (skillId) {
                            await tx("brief_skills")
                                .insert({
                                    brief_id: ids[0],
                                    skill_id: skillId
                                })
                        }

                    })
                }

                if (industry_ids) {
                    industry_ids.forEach(async (industry_id) => {
                        if (industry_id) {
                            await tx("brief_industries")
                                .insert({
                                    brief_id: ids[0],
                                    industry_id: industry_id
                                })
                        }

                    })
                }
                return ids[0]
            })
    );

export const incrementUserBriefSubmissions = (id: number) =>
    async (tx: Knex.Transaction) => (
        tx<User>("users").where({ id: id }).increment('briefs_submitted', 1)
    );

export const insertFederatedCredential = (
    id: number,
    issuer: string,
    subject: string,
) => async (tx: Knex.Transaction) => (
    await tx<FederatedCredential>("federated_credentials").insert({
        id, issuer, subject
    }).returning("*")
)[0];

export const upsertItems = (items: string[], tableName: string) => async (tx: Knex.Transaction) => {
    var item_ids: number[] = [];
    try {
        //TODO Convert to map
        for (const item of items) {
            var item_id: number;
            const existing_item = await tx(tableName).select().where({
                name: item.toLowerCase()
            }).first();

            if (!existing_item) {
                item_id = await (await insertToTable(item, tableName)(tx)).id;
            } else
                item_id = existing_item.id

            item_ids.push(item_id);
        }
    } catch (err) {
        console.log("Failed to insert new item ", err)
    }
    return item_ids;
};

export const getOrCreateFederatedUser = (
    issuer: string,
    username: string,
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
                subject: username,
            }).first();

            /**
             * If not, create the `usr`, then the `federated_credential`
             */
            if (!federated) {
                user = await insertUserByDisplayName(displayName, username)(tx);
                await insertFederatedCredential(user.id, issuer, username)(tx);
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

            if (!user.getstream_token) {
                const token = await generateGetStreamToken(user);
                await updateUserGetStreamToken(user.id, token)(tx);
            }

            done(null, user);
        } catch (err) {
            done(new Error(
                "Failed to upsert federated authentication."
            ));
        }
    });
};

export const fetchFreelancerDetailsByUserID = (user_id: number | string) =>
    (tx: Knex.Transaction) =>
        fetchAllFreelancers()(tx)
            .where({ "freelancers.user_id": user_id })
            .first()
            .debug(false)

export const fetchFreelancerDetailsByUsername = (username: string) =>
    (tx: Knex.Transaction) =>
        fetchAllFreelancers()(tx)
            .where({ username: username })
            .first()
            .debug(false)


export const fetchAllFreelancers = () =>
    (tx: Knex.Transaction) =>

        tx.select(
            "freelancers.id",
            "freelanced_before",
            "freelancing_goal",
            "work_type",
            "education",
            "experience",
            "facebook_link",
            "twitter_link",
            "telegram_link",
            "discord_link",
            "title",
            "bio",
            "freelancers.user_id",
            "username",
            "display_name",
            "web3_accounts.address as web3_address",
            "freelancers.created",
            tx.raw("ARRAY_AGG(DISTINCT CAST(skills.name as text)) as skills"),
            tx.raw("ARRAY_AGG(DISTINCT CAST(skills.id as text)) as skill_ids"),

            tx.raw("ARRAY_AGG(DISTINCT CAST(languages.name as text)) as languages"),
            tx.raw("ARRAY_AGG(DISTINCT CAST(languages.id as text)) as language_ids"),

            tx.raw("ARRAY_AGG(DISTINCT CAST(services.name as text)) as services"),
            tx.raw("ARRAY_AGG(DISTINCT CAST(services.id as text)) as service_ids"),

            tx.raw("ARRAY_AGG(DISTINCT CAST(clients.name as text)) as clients"),
            tx.raw("ARRAY_AGG(DISTINCT CAST(clients.id as text)) as client_ids"),

            tx.raw("ARRAY_AGG(DISTINCT CAST(clients.img as text)) as client_images"),
            tx.raw("ARRAY_AGG(DISTINCT CAST(clients.id as text)) as client_image_ids"),
            tx.raw("(SUM(freelancer_ratings.rating) / COUNT(freelancer_ratings.rating)) as rating"),
            tx.raw("COUNT(freelancer_ratings.rating) as num_ratings"),

        ).from<Freelancer>("freelancers")
            // Join services and many to many
            .leftJoin("freelancer_services", { 'freelancers.id': "freelancer_services.freelancer_id" })
            .leftJoin("services", { 'freelancer_services.service_id': "services.id" })
            // Join clients and many to many
            .leftJoin("freelancer_clients", { 'freelancers.id': "freelancer_clients.freelancer_id" })
            .leftJoin("clients", { 'freelancer_clients.client_id': "clients.id" })
            // Join skills and many to many
            .leftJoin("freelancer_skills", { 'freelancers.id': "freelancer_skills.freelancer_id" })
            .leftJoin("skills", { 'freelancer_skills.skill_id': "skills.id" })
            // Join languages and many to many
            .leftJoin("freelancer_languages", { 'freelancers.id': "freelancer_languages.freelancer_id" })
            .leftJoin("languages", { 'freelancer_languages.language_id': "languages.id" })
            .innerJoin("users", { "freelancers.user_id": "users.id" })
            .leftJoin("freelancer_ratings", { "freelancers.id": "freelancer_ratings.freelancer_id" })
            .leftJoin("web3_accounts", { "freelancers.user_id": "web3_accounts.user_id" })

            // order and group by many-many selects
            .orderBy("freelancers.created", "desc")
            .groupBy("freelancers.id")
            .groupBy("users.username")
            .groupBy("users.display_name")
            .groupBy("address")
            .orderBy("freelancers.id", "desc")
            // TODO Add limit until we have spinning loading icon in freelancers page
            .limit(100)


export const insertFreelancerDetails = (
    f: Freelancer, skill_ids: number[],
    language_ids: number[], client_ids: number[],
    service_ids: number[]) =>
    async (tx: Knex.Transaction) =>
        await tx<Freelancer>("freelancers").insert(
            {
                freelanced_before: f.freelanced_before.toString(),
                freelancing_goal: f.freelancing_goal,
                work_type: f.work_type,
                education: f.education,
                experience: f.experience,
                title: f.title,
                bio: f.bio,
                facebook_link: f.facebook_link,
                twitter_link: f.twitter_link,
                telegram_link: f.telegram_link,
                discord_link: f.discord_link,
                user_id: f.user_id
            })

            .returning("id")
            .then(ids => {
                if (skill_ids) {
                    skill_ids.forEach(async (skillId) => {
                        if (skillId) {
                            await tx("freelancer_skills")
                                .insert({
                                    freelancer_id: ids[0],
                                    skill_id: skillId
                                })
                        }

                    })
                }

                if (language_ids) {
                    language_ids.forEach(async (langId) => {
                        if (langId) {
                            await tx("freelancer_languages")
                                .insert({
                                    freelancer_id: ids[0],
                                    language_id: langId
                                })
                        }
                    })
                }

                if (client_ids) {
                    client_ids.forEach(async (clientId) => {
                        if (clientId) {
                            await tx("freelancer_clients")
                                .insert({
                                    freelancer_id: ids[0],
                                    client_id: clientId
                                })
                        }
                    })
                }

                if (service_ids) {
                    service_ids.forEach(async (serviceId) => {
                        if (serviceId) {
                            await tx("freelancer_services")
                                .insert({
                                    freelancer_id: ids[0],
                                    service_id: serviceId
                                })
                        }
                    })
                }

                return ids[0]
            })


export const updateFreelancerDetails = (userId: number, f: Freelancer) =>
    async (tx: Knex.Transaction) => (
        await tx<Freelancer>("freelancers").update({
            freelanced_before: f.freelanced_before,
            freelancing_goal: f.freelancing_goal,
            work_type: f.work_type,
            education: f.education,
            experience: f.experience,
            title: f.title,
            bio: f.bio,
            facebook_link: f.facebook_link,
            twitter_link: f.twitter_link,
            telegram_link: f.telegram_link,
            discord_link: f.discord_link,
            user_id: f.user_id
        })
            .where({ "user_id": userId }).returning("id")
    )



// The search briefs and all these lovely parameters.
// Since we are using checkboxes only i unfortunatly ended up using all these parameters.
// Because we could have multiple ranges of values and open ended ors.
export const searchBriefs =
    async (tx: Knex.Transaction, filter: BriefSqlFilter) =>
        // select everything that is associated with brief.
        fetchAllBriefs()(tx).where(function () {
            if (filter.submitted_range.length > 0) {
                this.whereBetween("users.briefs_submitted", [filter.submitted_range[0].toString(), Math.max(...filter.submitted_range).toString()]);
            }
            if (filter.submitted_is_max) {
                this.orWhere('users.briefs_submitted', '>=', Math.max(...filter.submitted_range))
            }
        })
            .where(function () {
                if (filter.experience_range.length > 0) {
                    this.whereIn("experience_id", filter.experience_range)
                }
            })
            .where(function () {
                if (filter.length_range.length > 0) {
                    this.whereIn("duration_id", filter.length_range)
                }
                if (filter.length_is_max) {
                    this.orWhere('duration_id', '>=', Math.max(...filter.length_range))
                }
            })
            .where("headline", "ilike", "%" + filter.search_input + "%")



export const searchFreelancers =
    async (tx: Knex.Transaction, filter: FreelancerSqlFilter) =>
        fetchAllFreelancers()(tx)
            .where(function () {
                if (filter.skills_range.length > 0) {
                    this.whereIn('freelancer_skills.skill_id', filter.skills_range)
                }
            })
            .where(function () {
                if (filter.services_range.length > 0) {
                    this.whereIn('freelancer_services.service_id', filter.services_range)
                }
            })
            .where(function () {
                if (filter.languages_range.length > 0) {
                    this.whereIn('freelancer_languages.language_id', filter.languages_range)
                }
            })
            .where("username", "ilike", "%" + filter.search_input + "%")
            .where("title", "ilike", "%" + filter.search_input + "%")
            .where("bio", "ilike", "%" + filter.search_input + "%")
            .debug(true)
