import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";

/**
 ** New table to store the milestone details
 */
export async function up(knex: Knex): Promise<void> {
    const milestonesTableName = "milestones";
    await knex.schema.createTable(milestonesTableName, (builder) => {
        builder.integer("milestone_index");
        builder.string("milestone_details").nullable();
        builder.integer("project_id").notNullable();
        builder.primary(["project_id","milestone_index"]);
        builder.foreign("project_id")
            .references("projects.id")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");

        builder.text("name");
        builder.integer("percentage_to_unlock");
        builder.boolean("is_approved").defaultTo(false);

        auditFields(knex, builder);
    }).then(onUpdateTrigger(knex, milestonesTableName));
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("milestones");
}

