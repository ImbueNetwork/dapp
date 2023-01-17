import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTableIfNotExists("experience", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("level");

        auditFields(knex, builder);

    }).then(function() {
        return knex("experience").insert([
            {id: 0, level: "Entry Level"},
            {id: 1, level: "Intermediate"},
            {id: 2, level: "Expert"},
            {id: 3, level: "Specialist"},
        ])
    }
    )
};

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("experience");
};
