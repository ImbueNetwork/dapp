import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("freelancer_ratings", (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.integer("freelancer_id");
        builder.foreign("freelancer_id").references("freelancers.id");
        builder.integer("rating");
        auditFields(knex, builder);
    }
    )
};

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("freelancer_ratings");
};
