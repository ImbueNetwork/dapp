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
        },
        {
            display_name: "Web3 dev",
            username: "web3dev",
            email: "web3dev@gmail.com",
            password: "testpassword",
        },
        {
            display_name: "frontend dev",
            username: "frontenddev",
            email: "frontenddev@gmail.com",
            password: "testpassword",
        }
    ]);
};

