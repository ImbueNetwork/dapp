"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateFederatedUser = exports.insertFederatedCredential = exports.fetchProjectMilestones = exports.deleteMilestones = exports.insertMilestones = exports.fetchUserProjects = exports.fetchAllProjects = exports.fetchProject = exports.updateProject = exports.insertProject = exports.insertUserByDisplayName = exports.upsertWeb3Challenge = exports.fetchUser = exports.fetchWeb3Account = void 0;
const index_1 = __importDefault(require("./db/index"));
const fetchWeb3Account = (address) => (tx) => tx("web3_accounts")
    .select()
    .where({ address, })
    .first();
exports.fetchWeb3Account = fetchWeb3Account;
const fetchUser = (id) => (tx) => tx("users").where({ id }).first();
exports.fetchUser = fetchUser;
const upsertWeb3Challenge = (user, address, type, challenge) => async (tx) => {
    let web3Account = await tx("web3_accounts")
        .select()
        .where({
        user_id: user?.id
    })
        .first();
    if (!web3Account) {
        return [
            (await tx("web3_accounts").insert({
                address,
                user_id: user.id,
                type,
                challenge,
            }).returning("*"))[0],
            true
        ];
    }
    return [
        (await tx("web3_accounts").update({ challenge }).where({ user_id: user.id }).returning("*"))[0],
        false
    ];
};
exports.upsertWeb3Challenge = upsertWeb3Challenge;
const insertUserByDisplayName = (displayName) => async (tx) => (await tx("users").insert({
    display_name: displayName
}).returning("*"))[0];
exports.insertUserByDisplayName = insertUserByDisplayName;
const insertProject = (project) => async (tx) => (await tx("projects").insert(project).returning("*"))[0];
exports.insertProject = insertProject;
const updateProject = (id, project) => async (tx) => (await tx("projects")
    .update(project)
    .where({ id })
    .returning("*"))[0];
exports.updateProject = updateProject;
const fetchProject = (id) => (tx) => tx("projects").select().where({ id }).first();
exports.fetchProject = fetchProject;
const fetchAllProjects = () => (tx) => tx("projects").select();
exports.fetchAllProjects = fetchAllProjects;
const fetchUserProjects = (id) => (tx) => tx("projects").select().where({
    user_id: id
}).select();
exports.fetchUserProjects = fetchUserProjects;
const insertMilestones = (milestones, project_id) => {
    const values = milestones.map((m, idx) => ({
        ...m,
        project_id,
        milestone_index: idx,
    }));
    return (tx) => tx("milestones").insert(values).returning("*");
};
exports.insertMilestones = insertMilestones;
const deleteMilestones = (project_id) => (tx) => tx("milestones").delete().where({ project_id });
exports.deleteMilestones = deleteMilestones;
const fetchProjectMilestones = (id) => (tx) => tx("milestones").select().where({ project_id: id });
exports.fetchProjectMilestones = fetchProjectMilestones;
const insertFederatedCredential = (id, issuer, subject) => async (tx) => (await tx("federated_credentials").insert({
    id, issuer, subject
}).returning("*"))[0];
exports.insertFederatedCredential = insertFederatedCredential;
const getOrCreateFederatedUser = (issuer, subject, displayName, done) => {
    index_1.default.transaction(async (tx) => {
        let user;
        try {
            /**
             * Do we already have a federated_credential ?
             */
            const federated = await tx("federated_credentials").select().where({
                issuer,
                subject,
            }).first();
            /**
             * If not, create the `usr`, then the `federated_credential`
             */
            if (!federated) {
                user = await (0, exports.insertUserByDisplayName)(displayName)(tx);
                await (0, exports.insertFederatedCredential)(user.id, issuer, subject)(tx);
            }
            else {
                const user_ = await index_1.default.select().from("users").where({
                    id: federated.id
                }).first();
                if (!user_) {
                    throw new Error(`Unable to find matching user by \`federated_credential.id\`: ${federated.id}`);
                }
                user = user_;
            }
            done(null, user);
        }
        catch (err) {
            done(new Error("Failed to upsert federated authentication.", { cause: err }));
        }
    });
};
exports.getOrCreateFederatedUser = getOrCreateFederatedUser;
