import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("briefs").insert([
    {
        headline: "Amazing Frontend Developer NEEDED!!",
        industries: ["Something Cool", "Another Weird Thing"],
        description: "We need some absolute wizard to create an ultra dynamic thing with carosels",
        duration: 12,
        budget: 1000,
        experience_id: 2,
        user_id: 1,
        scope: "what is this",
        skills: ["React","Javascript"]

    },
    {
        headline: "Amazing C++ Developer",
        industries: ["Something Cool", "Another Weird Thing but on the backend!"],
        description: "We need some absolute wizard to create an ultra cool, mega thing with spinning balls",
        duration: 5,
        budget: 200,
        experience_id: 3,
        user_id: 2,
        scope: "what is this",
        skills: ["C++","C"]
    }

    ]);
};
