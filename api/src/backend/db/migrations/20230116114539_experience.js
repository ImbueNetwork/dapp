import {Briefs, BriefFilterOptions} from "../../../frontend/briefs";

exports.up = async function(knex) {
    await knex.schema.createTableIfNotExists("experience", (builder) => {
        builder.primary("id")
            .string("level")
    }).then(onUpdateTrigger(knex, milestoneDetailsTableName))
    .then(
        Briefs.filters.forEach(function (filter) {
            if (filter.object == BriefFilterOptions.ExpLevel ) {
                filter.forEach(function (option) {
                    knex("experience").insert({
                        id: option.interiorIndex,
                        value: option.value,
                    })
                })
            }
        })
    )
};

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists("experience");
};
