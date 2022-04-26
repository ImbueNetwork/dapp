"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const utils_1 = require("../utils");
async function up(knex) {
    const tableName = "project_properties";
    await knex.schema.createTable(tableName, (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.text("faq");
        builder.integer("project_id").notNullable();
        builder.foreign("project_id")
            .references("projects.id");
        (0, utils_1.auditFields)(knex, builder);
    }).then((0, utils_1.onUpdateTrigger)(knex, tableName));
}
exports.up = up;
async function down(knex) {
    await knex.schema.dropTableIfExists("project_properties");
}
exports.down = down;
