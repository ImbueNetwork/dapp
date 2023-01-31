import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("clients", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("name");
        builder.string("img");
        auditFields(knex, builder);
    }); 

    await knex.schema.createTable("services", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("name");
        auditFields(knex, builder);
    });

    await knex.schema.createTable("languages", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.string("name");
        auditFields(knex, builder);
    });
};

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("clients");
    await knex.schema.dropTableIfExists("services");
    await knex.schema.dropTableIfExists("languages");
};
