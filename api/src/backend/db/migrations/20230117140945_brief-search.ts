import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
    
    // Alter the tables to allow for experienveID
    await knex.schema.alterTable("user", (builder) => {
        builder.integer("briefs_submitted");
        // change duration to be in days.
        // add hours per week to briefs.
        

    })
};

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("experience");
}; 
