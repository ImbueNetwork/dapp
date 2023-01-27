import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("experience", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("experience_level");
        auditFields(knex, builder);

    }).then(function() {
        return knex.schema.alterTable("briefs", (table) => {
            table.foreign("experience_id").references("experience.id");
        })
    })
};

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("experience");
}; 
