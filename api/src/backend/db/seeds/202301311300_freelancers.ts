import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await generate_freelancer(knex);
};

async function generate_freelancer(knex: Knex): Promise<void> {
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

    let industries = [
        "web3",
        "defi",
        "education",
        "agriculture",
        "communications",
        "health",
        "wellness",
        "energy",
        "sustainability",
        "arts",
        "real",
        "technology",
        "supply",
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
    skills.map(async(skill, a) => {
            clients.map(async (client, b) => {
                languages.map(async (lang, c) => {
                    services.map(async (service, d) => {

                    c = c + 1;
                    let rsmall =  Math.floor(Math.random() * (3 - 1 + 1)) + 1;
                    let rbig =  Math.floor(Math.random() * (100 - 1 + 1)) + 1;
                    // new user associated
                    await knex("users").insert([
                        {
                            display_name: skill + " pro" + rsmall.toExponential(rbig),
                            username: skill+lang,
                            email: skill+lang+"industry@gmail.com",
                            password: "testpassword",
                        }
                    ]).then(async () => {
                        await knex("freelancers").insert({
                        
                            freelanced_before: "I've freelanced before however, i may need some extra help.",
                            freelancing_goal: "To make a little extra money on the side",
                            title: "A " + lang + " speaking" + skill  + " professional",
                            bio: "I also have experience in " + service + " and have many clients including " + client,
                            work_type: "To make a little extra money on the side",
                            facebook_link: "www.facebook.com/pro" + lang + skill,
                            twitter_link: "www.twitter.com/pro" + lang + skill,
                            telegram_link: "www.telegram.com/pro" + lang + skill,
                            discord_link: "www.discord.com/pro" + lang + skill,
                            user_id: c,
                        }).then(async () => {
                            
                            for (let i = 0; i < rsmall; i++) {
                            
                                if (i == 0) {
                                    await knex("freelancer_skills").insert({ freelancer_id: c - 3, skill_id: a})
                                    await knex("freelancer_clients").insert({freelancer_id: c - 3, client_id: b})
                                    await knex("freelancer_services").insert({freelancer_id: c - 3, language_id: c})
                                    await knex("freelancer_languages").insert({freelancer_id: c - 3, service_id: a})
                                }

                                if (i != a) {
                                    await knex("freelancer_skills").insert({ freelancer_id: c - 3, skill_id: i})
                                }
                                if (i != b) {
                                    await knex("freelancer_clients").insert({ freelancer_id: c - 3, client_id: i})
                                }
                                if (i != c) {
                                    await knex("freelancer_services").insert({ freelancer_id: c - 3, service_id: i})
                                }
                                if (i != b) {
                                    await knex("freelancer_languages").insert({ freelancer_id: c - 3, language_id: i})
                                } 
                        } 

                        })
                    });
                })
            })
        })
    })

}
   