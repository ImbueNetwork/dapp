import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("brief_skills").del();
    await knex("brief_industries").del();
    await knex("briefs").del();
    await knex("freelancer_services").del();
    await knex("freelancer_clients").del();
    await knex("freelancer_skills").del();
    await knex("freelancer_languages").del();
    await knex("freelancers").del();
    await knex("users").del();
    await knex("project_status").del();
    await knex("experience").del();
    await knex("skills").del();
    await knex("industries").del();
};
