import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("users").insert([
        {
            display_name: "Dude Mckenzie",
            first_name: "Dude",
            last_name: "Mckenzie",
            email: "dudemks@gmail.com",
            password: "testpassword",
            briefs_submitted: 20,
        },
        {
            display_name: "Mike Doomer",
            first_name: "Mike",
            last_name: "Doomer",
            email: "mdoomer@gmail.com",
            password: "testpassword",
            briefs_submitted: 3,
        }
    ]);
};

