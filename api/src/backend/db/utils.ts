import type { Knex } from "knex";

const CTATZU = "(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')";
export const ON_UPDATE_TIMESTAMP_FUNCTION = `
CREATE OR REPLACE FUNCTION on_update_timestamp()
RETURNS trigger AS $$
BEGIN
    NEW.modified = ${CTATZU};
    RETURN NEW;
END;
$$ language 'plpgsql';
`;
export const DROP_ON_UPDATE_TIMESTAMP_FUNCTION =
    "DROP FUNCTION on_update_timestamp";

export const current_timestamp = (knex: Knex) => knex.raw(CTATZU);
export const auditFields = (knex: Knex, builder: Knex.CreateTableBuilder) => {
    builder.datetime("created").defaultTo(current_timestamp(knex));
    builder.datetime("modified").defaultTo(current_timestamp(knex));
};

export const onUpdateTrigger = (knex: Knex, table: string) => () => knex.raw(`
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
`);

