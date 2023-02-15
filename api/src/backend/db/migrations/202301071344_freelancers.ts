import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";


export async function up(knex: Knex): Promise<void> {
    const tableName = "freelancers";
    await knex.schema.createTable(tableName, (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.text("freelanced_before");
        builder.text("freelancing_goal");
        builder.text("work_type");
        builder.text("education");
        builder.text("experience");
        builder.text("title");

        builder.text("bio");

        // These fields can be found in tables:
        // freelancer_language, freelancer_client, freelancer_services, freelancer_skills
        
        //builder.specificType("language_ids", "integer[]");
        //builder.specificType("client_ids", "integer[]");
        //builder.specificType("services_ids", "integer[]");
        //builder.specificType("skill_ids", "integer[]");

        builder.text("facebook_link");
        builder.text("twitter_link");
        builder.text("telegram_link");
        builder.text("discord_link");

        builder.integer("user_id");
        builder.foreign("user_id")
        .references("users.id");
        
        auditFields(knex, builder);
    }).then(onUpdateTrigger(knex, tableName));
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("freelancers");
}
