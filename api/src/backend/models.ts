import { knex, Knex } from "knex";
import db from "./db/index";


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

export type Brief = {
    id?: string | number;
    headline: string;
    industry_ids: number[];
    description: string;
    skill_ids: number[];
    scope_id: number;
    duration_id: number;
    budget: bigint;
    // created_by: string;
    experience_id: number,
    // hours_per_week: number,
    // briefs_submitted_by: number,
    user_id: number;
};

export type Freelancer = {
    id?: string | number;
    freelanced_before: string;
    freelancing_goal: string;
    work_type: string;
    education: string;
    experience: string;
    skill_ids: number[];
    language_ids: number[];
    client_ids: number[];
    services_ids: number[];
    facebook_link: string;
    twitter_link: string;
    telegram_link: string;
    discord_link: string;
    title: string;
    bio: string;
    user_id?: string | number;
};


export type BriefSqlFilter = {
    experience_range: number[];
    submitted_range: number[];
    submitted_is_max: boolean;
    length_range: number[];
    length_is_max: boolean;
    max_hours_pw: number;
    hours_pw_is_max: boolean;
    search_input: string;
}

export const fetchWeb3Account = (address: string) =>
    (tx: Knex.Transaction) =>
        tx<Web3Account>("web3_accounts")
            .select()
            .where({ address, })
            .first();

export const fetchUser = (id: number) =>
    (tx: Knex.Transaction) =>
        tx<User>("users").where({ id }).first();

export const fetchUserOrEmail = (userOrEmail: string) =>
    (tx: Knex.Transaction) =>
        tx<User>("users").where({ username: userOrEmail.toLowerCase() })
            .orWhere({ email: userOrEmail.toLowerCase() })
            .first();

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

export const insertUserByDisplayName = (displayName: string) =>
    async (tx: Knex.Transaction) => (
        await tx<User>("users").insert({
            display_name: displayName
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
    tx<MilestoneDetails>("milestone_details").where({ project_id: id }).where('index', '=', milestoneId).update('details', details).returning("*");

export const insertMilestoneDetails = (value: MilestoneDetails) => async (tx: Knex.Transaction) => (await
    tx<MilestoneDetails>("milestone_details").insert(value).returning("*"))[0];

export const fetchAllMilestone = (id: string | number) =>
    (tx: Knex.Transaction) =>
        tx<MilestoneDetails>("milestone_details").where('project_id', '=', id);

export const fetchMilestoneByIndex = (projectId: string | number, milestoneId: string | number) =>
    (tx: Knex.Transaction) =>
        tx<MilestoneDetails>("milestone_details").select().where({ project_id: projectId }).where('index', '=', milestoneId);

export const fetchAllBriefs = () =>
    (tx: Knex.Transaction) =>
        tx.select(
            "all_briefs.id",
            "headline",
            "industries",
            "description",
            "skills",
            "scope_level",
            "duration",
            "budget",
            "users.display_name as created_by",
            "experience_level",
            "users.briefs_submitted as briefs_submitted_by",
        )
        .from(tx.raw(`\
    (WITH joined_skills AS ( SELECT briefs.id               as brief_id,
                            ARRAY_AGG(skills.name) as skills
                            FROM briefs
                            LEFT JOIN skills
                            ON skills.id = ANY (briefs.skill_ids)
                            GROUP BY briefs.id),
    joined_industries AS (SELECT briefs.id as brief_id,
                            ARRAY_AGG(industries.name) as industries
                            FROM briefs
                            LEFT JOIN industries ON industries.id = ANY (briefs.industry_ids)
                            GROUP BY briefs.id)
    SELECT headline,
                            id,
                            description,
                            budget,
                            scope_id,
                            duration_id,
                            user_id,
                            briefs.created,
                            experience_id,
                            joined_industries.industries,
                            joined_skills.skills
                            from briefs
                            join joined_industries on briefs.id = joined_industries.brief_id
                            join joined_skills on briefs.id = joined_skills.brief_id) as all_briefs
                            `))
        .innerJoin("experience", { 'all_briefs.experience_id': "experience.id" })
        .innerJoin("users", { "all_briefs.user_id": "users.id" })
        .innerJoin("scope", { "all_briefs.scope_id": "scope.id" })
        .innerJoin("duration", { "all_briefs.duration_id": "duration.id" })
        .orderBy("all_briefs.created", "desc")


export const insertBrief = (brief: Brief) =>
    async (tx: Knex.Transaction) => (
        await tx<Brief>("briefs").insert(brief).returning("*")
    )[0];

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

export const upsertItems = (items: string[], table_name: string) => async (tx: Knex.Transaction) => {
    var item_ids: number[] = [];
    try {
        for (const item of items) {
            var item_id: number;
            const existing_item = await tx(table_name).select().where({
                name: item.toLowerCase()
            }).first();

            if (!existing_item) {
                item_id = await (await insertToTable(item, table_name)(tx)).id;
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

export const fetchFreelancerDetailsByUserID = (user_id: number | string) =>
    (tx: Knex.Transaction) =>

    tx.select(
        "all_freelancers.id",
        "freelanced_before",
        "freelancing_goal",
        "work_type",
        "education",
        "experience",
        "skills",
        "languages",
        "clients",
        "client_images",
        "services",
        "facebook_link",
        "twitter_link",
        "telegram_link",
        "discord_link",
        "title",
        "bio",
        "user_id",
        "username",
        "display_name"
    )
    .from(tx.raw(`\
(WITH joined_skills AS ( SELECT freelancers.id as freelancer_id,
                        ARRAY_AGG(skills.name) as skills
                        FROM freelancers
                        LEFT JOIN skills
                        ON skills.id = ANY (freelancers.skill_ids)
                        GROUP BY freelancers.id),
joined_languages AS (SELECT freelancers.id as freelancer_id,
                        ARRAY_AGG(languages.name) as languages
                        FROM freelancers
                        LEFT JOIN languages ON languages.id = ANY (freelancers.language_ids)
                        GROUP BY freelancers.id),
joined_clients AS (SELECT freelancers.id as freelancer_id,
                            ARRAY_AGG(clients.name) as clients,
                            ARRAY_AGG(clients.img) as client_images
                            FROM freelancers
                            LEFT JOIN clients ON clients.id = ANY (freelancers.client_ids)
                            GROUP BY freelancers.id),
joined_services AS (SELECT freelancers.id as freelancer_id,
                                ARRAY_AGG(services.name) as services
                                FROM freelancers
                                LEFT JOIN services ON services.id = ANY (freelancers.services_ids)
                                GROUP BY freelancers.id)
SELECT 
                        id,
                        freelanced_before,
                        freelancing_goal,
                        work_type,
                        education,
                        experience,
                        skills,
                        languages,
                        clients,
                        client_images,
                        services,
                        facebook_link,
                        twitter_link,
                        telegram_link,
                        discord_link,
                        title,
                        bio,
                        user_id,
                        created from
                        freelancers 
                        join joined_skills on freelancers.id = joined_skills.freelancer_id
                        join joined_languages on freelancers.id = joined_languages.freelancer_id
                        join joined_clients on freelancers.id = joined_clients.freelancer_id
                        join joined_services on freelancers.id = joined_services.freelancer_id) as all_freelancers
                        `))
    .where({user_id})
    .innerJoin("users", { "all_freelancers.user_id": "users.id" })
    .orderBy("all_freelancers.created", "desc")
    .first();


export const fetchAllFreelancers = () =>
    (tx: Knex.Transaction) =>
    
    tx.select(
        "all_freelancers.id",
        "freelanced_before",
        "freelancing_goal",
        "work_type",
        "education",
        "experience",
        "skills",
        "languages",
        "clients",
        "client_images",
        "services",
        "facebook_link",
        "twitter_link",
        "telegram_link",
        "discord_link",
        "title",
        "bio",
        "user_id",
        "username",
        "display_name",
    )
    .from("freelancers")
    // Join services and many to many
    .leftJoin("freelancer_services", { 'freelancers.id': "freelancer_services.freelancer_id" })
    .leftJoin("services", { 'freelancer_services.service_id': "services.id" })
    // Join clients and many to many
    .leftJoin("freelancer_clients", { 'freelancers.id': "freelancer_clients.freelancer_id" })
    .leftJoin("clients", { 'freelancers_clients.client_id': "clients.id" })
    // Join skills and many to many
    .leftJoin("freelancer_skills", { 'freelancers.id': "freelancer_skills.freelancer_id" })
    .leftJoin("skills", { 'freelancers_skills.skill_id': "skills.id" })
    // Join languages and many to many
    .leftJoin("freelancer_languages", { 'freelancers.id': "freelancer_languages.freelancer_id" })
    .leftJoin("language", { 'freelancer_language.language_id': "languages.id" })
    .innerJoin("users", { "all_freelancers.user_id": "users.id" })

    // order and group by many-many selects
    .orderBy("all_freelancers.created", "desc")
    .groupBy("services")
    .groupBy("skills")
    .groupBy("clients")
    .groupBy("clients_images")
    .groupBy("languages")

    

export const fetchAllFreelancers2 = () =>
    (tx: Knex.Transaction) =>
    
    tx.select(
        "all_freelancers.id",
        "freelanced_before",
        "freelancing_goal",
        "work_type",
        "education",
        "experience",
        "skills",
        "languages",
        "clients",
        "client_images",
        "services",
        "facebook_link",
        "twitter_link",
        "telegram_link",
        "discord_link",
        "title",
        "bio",
        "user_id",
        "username",
        "display_name",
    )
    .from(tx.raw(`\
(WITH joined_skills AS ( SELECT freelancers.id as freelancer_id,
                        ARRAY_AGG(skills.name) as skills
                        FROM freelancers
                        LEFT JOIN skills
                        ON skills.id = ANY (freelancers.skill_ids)
                        GROUP BY freelancers.id),
joined_languages AS (SELECT freelancers.id as freelancer_id,
                        ARRAY_AGG(languages.name) as languages
                        FROM freelancers
                        LEFT JOIN languages ON languages.id = ANY (freelancers.language_ids)
                        GROUP BY freelancers.id),
joined_clients AS (SELECT freelancers.id as freelancer_id,
                            ARRAY_AGG(clients.name) as clients,
                            ARRAY_AGG(clients.img) as client_images
                            FROM freelancers
                            LEFT JOIN clients ON clients.id = ANY (freelancers.client_ids)
                            GROUP BY freelancers.id),
joined_services AS (SELECT freelancers.id as freelancer_id,
                                ARRAY_AGG(services.name) as services
                                FROM freelancers
                                LEFT JOIN services ON services.id = ANY (freelancers.services_ids)
                                GROUP BY freelancers.id)
SELECT 
                        id,
                        freelanced_before,
                        freelancing_goal,
                        work_type,
                        education,
                        experience,
                        skills,
                        languages,
                        clients,
                        client_images,
                        services,
                        facebook_link,
                        twitter_link,
                        telegram_link,
                        discord_link,
                        title,
                        bio,
                        user_id,
                        created from
                        freelancers 
                        join joined_skills on freelancers.id = joined_skills.freelancer_id
                        join joined_languages on freelancers.id = joined_languages.freelancer_id
                        join joined_clients on freelancers.id = joined_clients.freelancer_id
                        join joined_services on freelancers.id = joined_services.freelancer_id) as all_freelancers
                        `))
    .innerJoin("users", { "all_freelancers.user_id": "users.id" })
    .orderBy("all_freelancers.created", "desc")


export const insertFreelancerDetails = (freelancer: Freelancer) =>
    async (tx: Knex.Transaction) => (
        await tx<Freelancer>("freelancers").insert(freelancer).returning("*")
    )[0];

export const updateFreelancerDetails = (userId: string, freelancer: Freelancer) =>
    async (tx: Knex.Transaction) => (
        await tx<Freelancer>("freelancers").where({ user_id: userId }).update(freelancer).returning("*")
    )[0];



// The search briefs and all these lovely parameters.
// Since we are using checkboxes only i unfortunatly ended up using all these parameters.
// Because we could have multiple ranges of values and open ended ors.
export const searchBriefs =
    async (tx: Knex.Transaction, filter: BriefSqlFilter) =>
        // select everything that is associated with brief.
        await tx.select(
            "briefs.id",
            "headline",
            "industries",
            "description",
            "skills",
            "scope",
            "duration",
            "budget",
            "users.display_name as created_by",
            "experience_level",
            "hours_per_week",
            "users.briefs_submitted as briefs_submitted_by",
        ).from("briefs")
            .innerJoin("experience", { 'briefs.experience_id': "experience.id" })
            .innerJoin("users", { "briefs.user_id": "users.id" })
            .where(function () {
                if (filter.submitted_range.length > 0) {
                    this.whereIn("briefs_submitted", filter.submitted_range)
                }
                if (filter.submitted_is_max) {
                    this.orWhere('briefs_submitted', '>=', Math.max(...filter.submitted_range))
                }
            })
            .where(function () {
                if (filter.experience_range.length > 0) {
                    this.whereIn("experience_id", filter.experience_range)
                }
            })
            .where(function () {
                if (filter.length_range.length > 0) {
                    this.whereIn("duration", filter.length_range)
                }
                if (filter.length_is_max) {
                    this.orWhere('duration', '>=', Math.max(...filter.length_range))
                }
            })
            .where(function () {
                if (filter.max_hours_pw > 0) {
                    this.whereBetween("hours_per_week", [0, filter.max_hours_pw]);
                }
                if (filter.hours_pw_is_max) {
                    this.orWhere('hours_per_week', '>=', filter.max_hours_pw)
                }
            }).where("headline", "ilike", "%" + filter.search_input + "%")
            .limit(30)
            .debug(true)


