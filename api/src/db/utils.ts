import type { Knex } from "knex";

export const current_timestamp = (knex: Knex) => knex.raw("(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')");
export const auditFields = (knex: Knex, builder: Knex.CreateTableBuilder) => {
    builder.datetime("created").defaultTo(current_timestamp(knex));
    builder.datetime("modified").defaultTo(current_timestamp(knex));
};
