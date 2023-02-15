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

// created_by: string;
    // hours_per_week: number,
    // briefs_submitted_by: number,
export type Brief = {
    id?: string | number;
    headline: string;
    industries: string[];
    description: string;
    skills: string[];
    scope_id: number;
    scope_level: string;
    duration_id: number;
    duration: string;
    budget: bigint;
    experience_level: string,
    experience_id: number
    user_id: number;
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
<<<<<<< HEAD
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
                //"users.briefs_submitted as briefs_submitted_by",
                tx.raw("ARRAY_AGG(DISTINCT CAST(skills.name as text)) as skills"),
                tx.raw("ARRAY_AGG(DISTINCT CAST(industries.name as text)) as industries"),
                "users.id"
            )
            .from("briefs")
            .leftJoin("brief_industries", {"briefs.id": "brief_industries.brief_id"})
            .leftJoin("industries", {"brief_industries.industry_id": "industries.id"})
            .leftJoin("brief_skills", {"briefs.id": "brief_skills.brief_id"})
            .leftJoin("skills", {"brief_skills.skill_id": "skills.id"})
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
    
=======
(tx: Knex.Transaction) =>
    tx.select(
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
        "users.briefs_submitted as briefs_submitted_by",
        )
        .from("briefs")
        .innerJoin("experience", {'briefs.experience_id': "experience.id"})
        .innerJoin("users", {"briefs.user_id": "users.id"})
        .orderBy("briefs.created","desc")
>>>>>>> imbue-enterprise

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
        .then(async(ids) => {
            if (skill_ids != undefined) {
                skill_ids.forEach(async(skillId) => {
                    if (skillId != undefined) {
                        await tx("brief_skills")
                        .insert({
                            brief_id: ids[0],
                            skill_id: skillId
                        })
                    }
                    
                })
            }

            if (industry_ids != undefined) {
                industry_ids.forEach(async(industry_id) => {
                    if (industry_id != undefined) {
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
    fetchAllFreelancers()(tx)
    .where({user_id})
    .first()
    .debug(true)

    export const fetchFreelancerDetailsByUsername = (username: string) =>
    (tx: Knex.Transaction) =>
    fetchAllFreelancers()(tx)
    .where({username: username})
    .first()
    .debug(true)


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
        "user_id",
        "username",
        "display_name",
        "freelancers.created",
        tx.raw("ARRAY_AGG(DISTINCT CAST(skills.name as text)) as skills"),
        tx.raw("ARRAY_AGG(DISTINCT CAST(languages.name as text)) as languages"),
        tx.raw("ARRAY_AGG(DISTINCT CAST(services.name as text)) as services"),
        tx.raw("ARRAY_AGG(DISTINCT CAST(clients.name as text)) as clients"),
        tx.raw("ARRAY_AGG(DISTINCT CAST(clients.img as text)) as client_images"),
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
    .leftJoin("freelancer_ratings", {"freelancers.id": "freelancer_ratings.freelancer_id"})

    // order and group by many-many selects
    .orderBy("freelancers.created", "desc")
    .groupBy("freelancers.id")
    .groupBy("users.username")
    .groupBy("users.display_name")


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
                if (skill_ids != undefined) {
                    skill_ids.forEach(async(skillId) => {
                        if (skillId != undefined) {
                            await tx("freelancer_skills")
                            .insert({
                                freelancer_id: ids[0],
                                skill_id: skillId
                            })
                        }
                        
                    })
                }
                
                if (language_ids != undefined) {
                    language_ids.forEach(async(langId) => {
                        if (langId != undefined) {
                            await tx("freelancer_languages")
                            .insert({
                                freelancer_id: ids[0],
                                language_id: langId
                            })
                        }
                    })
                }
                
                if (client_ids != undefined) {
                    client_ids.forEach(async(clientId) => {
                        if (clientId != undefined) {
                            await tx("freelancer_clients")
                            .insert({
                                freelancer_id: ids[0],
                                client_id: clientId
                            })
                        }
                    })
                }
                
                if (service_ids != undefined) {
                    service_ids.forEach(async(serviceId) => {
                        if (serviceId != undefined) {
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


// TODO.
export const updateFreelancerDetails = (userId: number, freelancer: Freelancer) => 
    async (tx: Knex.Transaction) => (
        await tx<Freelancer>("freelancers").update(freelancer).returning("*")
        )[0];



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


