import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
        await knex("services").insert([
            {name: "web development"},
            {name: "web design"},
            {name: "mobile (android/ios)"},
            {name: "copywriting"},
            {name: "smart contracts"},
            {name: "video editing"},
            {name: "nft"},
        ]);

        await knex("clients").insert([
            {name: "imbue", img:"imbue-img"},
            {name: "mangata", img:"mangata-img"},
            {name: "oak", img:"oak-img"},
            {name: "nft club", img:"nft-club-img"},
        ]);

        await knex("languages").insert([
            {name: "french"},
            {name: "german"},
            {name: "dutch"},
            {name: "spanish"},
            {name: "arabic"},
            {name: "urdu"},
            {name: "hindi"},
        ]);
};
