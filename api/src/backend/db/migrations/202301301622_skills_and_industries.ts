import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
    
    // Base Tables
    await knex.schema.createTable("skills", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("name");
        auditFields(knex, builder);
    }).then( async () => {
        await knex.schema.createTable("freelancer_skills", (builder) => {
            builder.increments("id", { primaryKey: true });
            builder.integer("skill_id");
            builder.integer("freelancer_id");
            builder.foreign("skill_id").references("skills.id"); 
            builder.foreign("freelancer_id").references("freelancers.id"); 
            auditFields(knex, builder);
        });
        await knex.schema.createTable("brief_skills", (builder) => {
            builder.increments("id", { primaryKey: true });
            builder.integer("skill_id");
            builder.integer("brief_id");
            builder.foreign("skill_id").references("skills.id"); 
            builder.foreign("brief_id").references("briefs.id"); 
            auditFields(knex, builder);
        });
    });

    await knex.schema.createTable("industries", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("name");
        auditFields(knex, builder);
    }).then(async () => {
        await knex.schema.createTable("brief_industries", (builder) => {
            builder.increments("id", { primaryKey: true });
            builder.integer("industry_id");
            builder.integer("brief_id");
            builder.foreign("industry_id").references("industries.id"); 
            builder.foreign("brief_id").references("briefs.id"); 
            auditFields(knex, builder);
        });
    });


    // Associated many-many tables
    
};

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("skills");
    await knex.schema.dropTableIfExists("industries");
};
