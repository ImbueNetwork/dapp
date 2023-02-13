import type { Knex } from "knex";
import { auditFields, DROP_ON_UPDATE_TIMESTAMP_FUNCTION, onUpdateTrigger, ON_UPDATE_TIMESTAMP_FUNCTION } from "../utils";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION);
    const usersTableName = "users";
    await knex.schema.alterTable(usersTableName, (builder) => {
        // username must be unique.
        builder.text("username").unique();
        builder.text("email");
        builder.text("password");
    });
}

export async function down(knex: Knex): Promise<void> {
    const usersTableName = "users";
    await knex.schema.alterTable(usersTableName, (builder) => {
        builder.dropColumn("username");
        builder.dropColumn("email");
        builder.dropColumn("password");
    });
}