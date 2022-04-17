"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
async function seed(knex) {
    try {
        // Deletes ALL existing entries
        await knex("project_status").del();
        await knex("project_status").insert([
            { status: "draft" },
            { status: "submitted" },
            { status: "finalized" },
        ]);
    }
    catch (e) {
        //
    }
}
exports.seed = seed;
;
