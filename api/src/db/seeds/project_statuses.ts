import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("project_status").del();

    // Inserts seed entries
    await knex("project_status").insert([
        { status: "draft" },
        { status: "submitted" },
        { status: "finalized" },
    ]);
};
