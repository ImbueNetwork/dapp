import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
    
    // Base Tables
    await knex.schema.createTable("skills", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("name");
        auditFields(knex, builder);
    });

    await knex.schema.createTable("industries", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("name");
        auditFields(knex, builder);
    });


    // Associated many-many tables
    await knex.schema.createTable("freelancer_skills", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.integer("skill_id");
        builder.integer("freelancer_id");
        builder.foreign("skill_id").references("skills.id"); 
        builder.foreign("freelancer_id").references("freelancers.id"); 
        auditFields(knex, builder);
    });
};

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("skills");
    await knex.schema.dropTableIfExists("industries");
};
