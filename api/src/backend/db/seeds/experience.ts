import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    try {
        await knex("experience").del();
        await knex("experience").insert([
            {id: 0, experience_level: "Entry Level"},
            {id: 1, experience_level: "Intermediate"},
            {id: 2, experience_level: "Expert"},
            {id: 3, experience_level: "Specialist"},
        ])

    } catch (e) {
        //
    }
};
