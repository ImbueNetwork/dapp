import type { Knex } from "knex";
import { auditFields, DROP_ON_UPDATE_TIMESTAMP_FUNCTION, onUpdateTrigger, ON_UPDATE_TIMESTAMP_FUNCTION } from "../utils";

/**
 ** New table to store the milestone details
 */
export async function up(knex: Knex): Promise<void> {
    await knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION);
    const usersTableName = "users";
    await knex.schema.alterTable(usersTableName, (builder) => {
        builder.text("display_name");
        builder.text("first_name");
        builder.text("last_name");
        builder.text("email");
        builder.text("password");
    });
}

export async function down(knex: Knex): Promise<void> {
    const usersTableName = "users";
    await knex.schema.alterTable(usersTableName, (builder) => {
        builder.dropColumn("display_name");
        builder.dropColumn("first_name");
        builder.dropColumn("last_name");
        builder.dropColumn("email");
        builder.dropColumn("password");
    });
}