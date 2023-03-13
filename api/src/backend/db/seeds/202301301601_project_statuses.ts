import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
        await knex("project_status").insert([
            { status: "draft" },
            { status: "pending review" },
            { status: "rejected" },
            { status: "accepted" },
        ]);
};
