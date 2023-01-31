import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("skills").insert([
        {name: "substrate"},
        {name: "rust"},
        {name: "react"},
        {name: "typescript"},
        {name: "javascript"},
        {name: "c++"},
        {name: "polkadot"},
        {name: "figma"},
        {name: "adobe photoshop"},
    ]);

    await knex("industries").insert([
        {name: "web3"},
        {name: "defi"},
        {name: "education"},
        {name: "agriculture"},
        {name: "communications"},
        {name: "health"},
        {name: "wellness"},
        {name: "energy"},
        {name: "sustainability"},
        {name: "arts and culture"},
        {name: "real estate"},
        {name: "technology"},
        {name: "supply chain"},
    ]);
};
