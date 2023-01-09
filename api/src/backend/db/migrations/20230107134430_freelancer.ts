import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";


export async function up(knex: Knex): Promise<void> {
    const tableName = "freelancers";
    await knex.schema.createTable(tableName, (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.text("freelanced_before");
        builder.text("work_type");
        builder.text("education");
        builder.text("experience");
        builder.text("title");
        builder.text("skills");
        builder.text("languages");
        builder.text("bio");
        builder.text("services_offer");
        // builder.integer("budget");
        builder.string("user_id");
        auditFields(knex, builder);
    }).then(onUpdateTrigger(knex, tableName));
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("freelancers");
}
