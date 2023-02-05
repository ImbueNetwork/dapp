import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    let skills = [
        "substrate",
        "rust",
        "react",
        "typescript",
        "javascript",
        "c",
        "polkadot",
        "figma",
        "adobe",
    ]
    let services = [
        "web development",
        "web design",
        "mobile",
        "android",
        "copywriting",
        "smart contracts",
        "video editing",
        "nft",
    ]
    let clients = [
        "imbue",
        "mangata",
        "oak",
        "nft",
    ]
    let languages = [
        "french",
        "german",
        "dutch",
        "spanish",
        "arabic",
        "urdu",
        "hindi",
    ]

    let c = 4;
    for (let a = 1; a == skills.length; a++) {
        for (let b = 1; b == clients.length; b++) {
            for (let c = 1; c == languages.length; c++) {
                for (let d = 1; d == services.length; d++) {
                    c = c + 1;
                    let rsmall =  Math.floor(Math.random() * (3 - 1 + 1)) + 1;
                    let rbig =  Math.floor(Math.random() * (100 - 1 + 1)) + 1;
                    // new user associated
                    await knex("users").insert(
                        {
                            display_name: skills[a] + " pro" + rsmall.toExponential(rbig),
                            username: skills[a]+languages[c],
                            email: skills[a]+languages[c]+"industry@gmail.com",
                            password: "testpassword",
                        }
                     )
                    //.then(async () => {
                    //     await knex("freelancers").insert({
                        
                    //         freelanced_before: "I've freelanced before however, i may need some extra help.",
                    //         freelancing_goal: "To make a little extra money on the side",
                    //         title: "A " + languages[c] + " speaking" + skills[a]  + " professional",
                    //         bio: "I also have experience in " + services[d] + " and have many clients including " + clients[b],
                    //         work_type: "To make a little extra money on the side",
                    //         facebook_link: "www.facebook.com/pro" + languages[c] + skills[a],
                    //         twitter_link: "www.twitter.com/pro" + languages[c] + skills[a],
                    //         telegram_link: "www.telegram.com/pro" + languages[c] + skills[a],
                    //         discord_link: "www.discord.com/pro" + languages[c] + skills[a],
                    //         user_id: c,
                    //     }).then(async () => {
                            
                    //         for (let i = 0; i < rsmall; i++) {
                            
                    //             if (i == 0) {
                    //                 await knex("freelancer_skills").insert({ freelancer_id: c - 3, skill_id: a})
                    //                 await knex("freelancer_clients").insert({freelancer_id: c - 3, client_id: b})
                    //                 await knex("freelancer_languages").insert({freelancer_id: c - 3, service_id: c})
                    //                 await knex("freelancer_services").insert({freelancer_id: c - 3, language_id: d})
                    //             }

                    //             if (i != a) {
                    //                 await knex("freelancer_skills").insert({ freelancer_id: c - 3, skill_id: i})
                    //             }
                    //             if (i != b) {
                    //                 await knex("freelancer_clients").insert({ freelancer_id: c - 3, client_id: i})
                    //             }
                    //             if (i != c) {
                    //                 await knex("freelancer_languages").insert({ freelancer_id: c - 3, language_id: i})
                    //             } 
                    //             if (i != d) {
                    //                 await knex("freelancer_services").insert({ freelancer_id: c - 3, service_id: i})
                    //             }
                    //     } 

                    //     })
                    // })
                }
            }
        }
    }

};
   