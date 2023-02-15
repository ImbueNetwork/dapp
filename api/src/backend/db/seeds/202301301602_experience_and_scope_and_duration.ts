import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
        await knex("experience").insert([
            {experience_level: "Entry Level"},
            {experience_level: "Intermediate"},
            {experience_level: "Expert"},
            {experience_level: "Specialist"},
        ]);

        await knex("scope").insert([
            {scope_level: "Small"},
            {scope_level: "Medium"},
            {scope_level: "Large"},
            {scope_level: "Complex"},
        ]);

        await knex("duration").insert([
            {duration: "1 to 3 months"},
            {duration: "3-6 months"},
            {duration: "More than 6 months"},
            {duration: "More than a year"},
        ]);
};
