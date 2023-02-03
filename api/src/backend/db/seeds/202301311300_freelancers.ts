import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("freelancers").insert([
        {
            freelanced_before: "I've freelanced before however, i may need some extra help.",
            freelancing_goal: "To make a little extra money on the side",
            title: "Amazing Web3 Dev",
            bio: "Amazing Web3 Dev",
            work_type: "To make a little extra money on the side",
            facebook_link: "www.facebook.com",
            twitter_link: "www.twitter.com",
            telegram_link: "www.telegram.com",
            discord_link: "www.discord.com",
            user_id: 2,
        },
        {
            freelanced_before: "I've freelanced before however, i may need some extra help.",
            freelancing_goal: "To make a little extra money on the side",
            title: "Amazing Web3 Dev",
            bio: "Amazing Web3 Dev",
            work_type: "To make a little extra money on the side",
            facebook_link: "www.facebook.com",
            twitter_link: "www.twitter.com",
            telegram_link: "www.telegram.com",
            discord_link: "www.discord.com",
            user_id: 3,
        },
    ]).then(async () => {
        await knex("freelancer_services").insert([
            {freelancer_id: 1, service_id: 4}, 
            {freelancer_id: 1, service_id: 1},
            {freelancer_id: 1, service_id: 2}, 
            {freelancer_id: 1, service_id: 3},
            {freelancer_id: 2, service_id: 2}, 
            {freelancer_id: 2, service_id: 1},
            {freelancer_id: 2, service_id: 3}, 
        ])
    
        await knex("freelancer_clients").insert([
            {freelancer_id: 2, client_id: 4}, 
            {freelancer_id: 2, client_id: 1},
            {freelancer_id: 2, client_id: 2}, 
            {freelancer_id: 2, client_id: 3},
            {freelancer_id: 1, client_id: 2}, 
            {freelancer_id: 1, client_id: 1},
            {freelancer_id: 1, client_id: 3}, 
        ])
        
        await knex("freelancer_skills").insert([
            {freelancer_id: 2, skill_id: 4}, 
            {freelancer_id: 2, skill_id: 1},
            {freelancer_id: 2, skill_id: 2}, 
            {freelancer_id: 2, skill_id: 3},
            {freelancer_id: 1, skill_id: 4}, 
            {freelancer_id: 1, skill_id: 5},
            {freelancer_id: 1, skill_id: 6},
        ])
        
        await knex("freelancer_languages").insert([
            {freelancer_id: 2, language_id: 4}, 
            {freelancer_id: 2, language_id: 1},
            {freelancer_id: 2, language_id: 2}, 
            {freelancer_id: 2, language_id: 3},
            {freelancer_id: 1, language_id: 4}, 
            {freelancer_id: 1, language_id: 5},
            {freelancer_id: 1, language_id: 6},
        ])
    
    });

    
};

