import { Knex } from "knex";
// import bcrypt from 'bcryptjs'

export async function seed(knex: Knex): Promise<void> {
    // let skills = [
    //     "substrate",
    //     "rust",
    //     "react",
    //     "typescript",
    //     "javascript",
    //     "c",
    //     "polkadot",
    //     "figma",
    //     "adobe",
    // ]
    // let services = [
    //     "web development",
    //     "web design",
    //     "mobile",
    //     "android",
    //     "copywriting",
    //     "smart contracts",
    //     "video editing",
    //     "nft",
    // ]
    // let clients = [
    //     "imbue",
    //     "mangata",
    //     "oak",
    //     "nft",
    // ]
    // let languages = [
    //     "french",
    //     "german",
    //     "dutch",
    //     "spanish",
    //     "arabic",
    //     "urdu",
    //     "hindi",
    // ]
    // let id = 0;
    // for (let a = 1; a < skills.length; a++) {
    //     for (let b = 1; b < clients.length; b++) {
    //         for (let c = 1; c < languages.length; c++) {
    //             for (let d = 1; d < services.length; d++) {
    //                 id = id + 1;
    //                 let rsmall =  Math.floor(Math.random() * (5));
    //                 let rbig =  Math.floor(Math.random() * (100000));

    //                 // new user associated
    //                 await knex("users").insert(
    //                     [{
    //                         display_name: skills[a] + "_" + clients[b] + "_" + services[d] + rbig,
    //                         username: skills[a].replace(" ","_") + "_" + clients[b].replace(" ","_") + "_" + services[d].replace(" ","_") + rbig,
    //                         email: skills[a] + languages[c] + rbig + "@gmail.com",
    //                         password:  a < 2 ? bcrypt.hashSync("testpassword") : "testpassword"  
    //                     }]
    //                  ).then(async () => {
    //                      await knex("freelancers").insert({
    //                          freelanced_before: "I've freelanced before however, i may need some extra help.",
    //                          freelancing_goal: "To make a little extra money on the side",
    //                          title: "Mega cool " + skills[a]  + " professional " + rbig,
    //                          bio: "I also have experience in " + services[d] + " and have many clients including " + clients[b],
    //                          work_type: "To make a little extra money on the side",
    //                          facebook_link: "www.facebook.com/pro" + skills[a],
    //                          twitter_link: "www.twitter.com/pro" + skills[a],
    //                          telegram_link: "www.telegram.com/pro" + skills[a],
    //                          discord_link: "www.discord.com/pro" + skills[a],
    //                          user_id: id + 3,
    //                      }).then(async () => {
                      
    //                          for (let i = 0; i <= rsmall; i++) {
                      
    //                              if (i == 0) {
    //                                  await knex("freelancer_skills").insert({ freelancer_id: id, skill_id: a})
    //                                  await knex("freelancer_skills").insert({ freelancer_id: id, skill_id: b})
    //                                  await knex("freelancer_skills").insert({ freelancer_id: id, skill_id: c})
    //                                  await knex("freelancer_clients").insert({freelancer_id: id, client_id: b})
    //                                  await knex("freelancer_languages").insert({freelancer_id: id,language_id: c})
    //                                  await knex("freelancer_services").insert({freelancer_id: id, service_id: d})
    //                              if (i > 0) {
    //                                 if (i != a) {
    //                                     await knex("freelancer_skills").insert({ freelancer_id: id, skill_id: i})
    //                                 }
    //                                 if (i != b) {
    //                                     await knex("freelancer_clients").insert({ freelancer_id: id, client_id: i})
    //                                 }
    //                                 if (i != c) {
    //                                     await knex("freelancer_languages").insert({ freelancer_id: id, language_id: i})
    //                                 } 
    //                                 if (i != d) {
    //                                     await knex("freelancer_services").insert({ freelancer_id: id, service_id: i})
    //                                 }
    //                              }
    //                             }
    //                     }})
    //                  })
    //             }
    //         }
    //     }
    // }

};
   