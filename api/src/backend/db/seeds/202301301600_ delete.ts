import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("briefs").del();
    await knex("users").del();
    await knex("project_status").del();
    await knex("experience").del();
    await knex("skills").del();
    await knex("industries").del();
};
