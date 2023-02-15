import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("skills").insert([
        { name: "substrate" },
        { name: "rust" },
        { name: "react" },
        { name: "typescript" },
        { name: "javascript" },
        { name: "c++" },
        { name: "polkadot" },
        { name: "figma" },
        { name: "adobe photoshop" },
    ]);

    await knex("industries").insert([
        { name: "web3" },
        { name: "defi" },
        { name: "education" },
        { name: "agriculture" },
        { name: "communications" },
        { name: "health" },
        { name: "wellness" },
        { name: "energy" },
        { name: "sustainability" },
        { name: "arts and culture" },
        { name: "real estate" },
        { name: "technology" },
        { name: "supply chain" },
    ]);

    // Backend Brief
    await knex("brief_skills").insert({ brief_id: 1, skill_id: 1 });
    await knex("brief_skills").insert({ brief_id: 1, skill_id: 2 });
    await knex("brief_skills").insert({ brief_id: 1, skill_id: 6 });
    await knex("brief_skills").insert({ brief_id: 1, skill_id: 7 });
    await knex("brief_industries").insert({ brief_id: 1, industry_id: 1 });
    await knex("brief_industries").insert({ brief_id: 1, industry_id: 2 });

    // Frontend Brief
    await knex("brief_skills").insert({ brief_id: 2, skill_id: 3 });
    await knex("brief_skills").insert({ brief_id: 2, skill_id: 4 });
    await knex("brief_skills").insert({ brief_id: 2, skill_id: 5 });
    await knex("brief_skills").insert({ brief_id: 2, skill_id: 8 });
    await knex("brief_industries").insert({ brief_id: 2, industry_id: 1 });
    await knex("brief_industries").insert({ brief_id: 2, industry_id: 2 });

};
