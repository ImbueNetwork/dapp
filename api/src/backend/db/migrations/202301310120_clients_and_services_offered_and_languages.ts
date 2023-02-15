import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {

    //builder.specificType("client_ids", "integer[]");
    await knex.schema.createTable("clients", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("name");
        builder.string("img");
        auditFields(knex, builder);
    }).then(async () => {
        await knex.schema.createTable("freelancer_clients", (builder) => {
            builder.increments("id", { primaryKey: true });
            builder.integer("client_id");
            builder.integer("freelancer_id");
            builder.foreign("client_id").references("clients.id"); 
            builder.foreign("freelancer_id").references("freelancers.id"); 
            auditFields(knex, builder);
        });
    }); 

    //builder.specificType("services_ids", "integer[]");
    await knex.schema.createTable("services", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("name");
        auditFields(knex, builder);
    }).then(async () => {
        await knex.schema.createTable("freelancer_services", (builder) => {
            builder.increments("id", { primaryKey: true });
            builder.integer("service_id");
            builder.integer("freelancer_id");
            builder.foreign("service_id").references("services.id"); 
            builder.foreign("freelancer_id").references("freelancers.id"); 
            auditFields(knex, builder);
        });

    }); 

    //builder.specificType("language_ids", "integer[]");
    await knex.schema.createTable("languages", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("name");
        auditFields(knex, builder);
    }).then(async () => {
        await knex.schema.createTable("freelancer_languages", (builder) => {
            builder.increments("id", { primaryKey: true });
            builder.integer("language_id");
            builder.integer("freelancer_id");
            builder.foreign("language_id").references("languages.id"); 
            builder.foreign("freelancer_id").references("freelancers.id"); 
            auditFields(knex, builder);
        });     
    }); 


};

        //builder.specificType("skill_ids", "integer[]");


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("clients");
    await knex.schema.dropTableIfExists("services");
    await knex.schema.dropTableIfExists("languages");
};
