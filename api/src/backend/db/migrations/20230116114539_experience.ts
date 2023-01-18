import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("experience", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("experience_level");
        auditFields(knex, builder);

    }).then(function() {
        return knex("experience").insert([
            {id: 0, experience_level: "Entry Level"},
            {id: 1, experience_level: "Intermediate"},
            {id: 2, experience_level: "Expert"},
            {id: 3, experience_level: "Specialist"},
        ])
    }).then(function() {
        return knex.schema.alterTable("briefs", (table) => {
            table.foreign("experience_id").references("experience.id");
        })
    })
};

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("experience");
}; 
