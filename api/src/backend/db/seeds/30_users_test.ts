import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("users").insert([
        {
            display_name: "Dude Mckenzie",
            username: "dudester",
            email: "dudemks@gmail.com",
            password: "testpassword",
            briefs_submitted: 20,
        },
        {
            display_name: "Mike Doomer",
            username: "doober",
            email: "mdoomer@gmail.com",
            password: "testpassword",
            briefs_submitted: 3,
        }
    ]);
};

