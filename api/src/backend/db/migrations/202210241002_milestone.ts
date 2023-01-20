import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";

/**
 ** New table to store the milestone details
 */
export async function up(knex: Knex): Promise<void> {
    const milestoneDetailsTableName = "milestone_details";
    await knex.schema.createTable(milestoneDetailsTableName, (builder) => {
        builder.integer("index").notNullable();
        builder.integer("project_id").notNullable();
        builder.string("details").nullable();
        builder.primary(["project_id", "index"]);
        builder.foreign("project_id")
            .references("projects.id")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");
        auditFields(knex, builder);
    }).then(onUpdateTrigger(knex, milestoneDetailsTableName));
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("milestone_details");
}

