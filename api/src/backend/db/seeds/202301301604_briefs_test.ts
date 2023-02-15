import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("briefs").insert([
    {
        headline: "Amazing Frontend Developer NEEDED!!",
        //industry_ids: [1, 2],
        description: "We need some absolute wizard to create an ultra dynamic thing with carosels",
        duration_id: 2,
        budget: 1000,
        experience_id: 2,
        user_id: 1,
        scope_id: 2,
        //skill_ids: [3,4]
    },
    {
        headline: "Amazing C++ Developer",
        //industry_ids: [2, 3],
        description: "We need some absolute wizard to create an ultra cool, mega thing with spinning balls",
        duration_id: 1,
        budget: 200,
        experience_id: 3,
        user_id: 2,
        scope_id: 1,
        //skill_ids: [2,6]
    }
    ]);
};
