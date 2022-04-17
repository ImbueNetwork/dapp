"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUpdateTrigger = exports.auditFields = exports.current_timestamp = exports.DROP_ON_UPDATE_TIMESTAMP_FUNCTION = exports.ON_UPDATE_TIMESTAMP_FUNCTION = void 0;
const CTATZU = "(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')";
exports.ON_UPDATE_TIMESTAMP_FUNCTION = `
CREATE OR REPLACE FUNCTION on_update_timestamp()
RETURNS trigger AS $$
BEGIN
    NEW.modified = ${CTATZU};
    RETURN NEW;
END;
$$ language 'plpgsql';
`;
exports.DROP_ON_UPDATE_TIMESTAMP_FUNCTION = "DROP FUNCTION on_update_timestamp";
const current_timestamp = (knex) => knex.raw(CTATZU);
exports.current_timestamp = current_timestamp;
const auditFields = (knex, builder) => {
    builder.datetime("created").defaultTo((0, exports.current_timestamp)(knex));
    builder.datetime("modified").defaultTo((0, exports.current_timestamp)(knex));
};
exports.auditFields = auditFields;
const onUpdateTrigger = (knex, table) => () => knex.raw(`
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
`);
exports.onUpdateTrigger = onUpdateTrigger;
