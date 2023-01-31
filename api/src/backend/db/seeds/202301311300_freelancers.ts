import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("freelancers").insert([
        {
            freelanced_before: "I've freelanced before however, i may need some extra help.",
            freelancing_goal: "To make a little extra money on the side",
            title: "Amazing Web3 Dev",
            bio: "Amazing Web3 Dev",
            work_type: "To make a little extra money on the side",
            services_ids: [1,2],
            language_ids: [1,2],
            client_ids: [1,2],
            skill_ids: [3,4],
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
            services_ids: [1,2],
            language_ids: [1,2],
            client_ids: [1,2],
            skill_ids: [3,4],
            facebook_link: "www.facebook.com",
            twitter_link: "www.twitter.com",
            telegram_link: "www.telegram.com",
            discord_link: "www.discord.com",
            user_id: 3,
        },
    ]);
};

