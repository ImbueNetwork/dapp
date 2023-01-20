import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    try {
        // Deletes ALL existing entries
        await knex("project_status").del();

        await knex("project_status").insert([
            { status: "draft" },
            { status: "submitted" },
            { status: "finalized" },
        ]);
        
        
    } catch (e) {
        //
    }
};
