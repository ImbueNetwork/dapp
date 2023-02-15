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
    });

    await knex.schema.createTable("scope", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("scope_level");
        auditFields(knex, builder);

    }).then(function() {
        return knex.schema.alterTable("briefs", (table) => {
            table.foreign("scope_id").references("scope.id");
        })
    });

    await knex.schema.createTable("duration", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("duration");
        auditFields(knex, builder);

    }).then(function() {
        return knex.schema.alterTable("briefs", (table) => {
            table.foreign("duration_id").references("duration.id");
        })
    });
};

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("experience");
    await knex.schema.dropTableIfExists("scope");
    await knex.schema.dropTableIfExists("duration");
};
