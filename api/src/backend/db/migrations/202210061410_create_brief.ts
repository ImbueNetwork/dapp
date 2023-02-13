import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";


export async function up(knex: Knex): Promise<void> {
    const tableName = "briefs";
    await knex.schema.createTable(tableName, (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.text("headline");

        builder.text("description");
        
        //you can find these in brief_languages and brief_industries tables
        builder.specificType("skill_ids", "integer[]");
        builder.specificType("industry_ids", "integer[]");

        builder.integer("scope_id");
        builder.integer("duration_id");
        builder.bigInteger("budget");
        builder.integer("experience_id");

        // stored in its own table
        // The foreign key is put on in the experience migration.
        builder.integer("user_id");
        builder.foreign("user_id").references("users.id"); 
        auditFields(knex, builder);
    }).then(onUpdateTrigger(knex, tableName));
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("briefs");
}

