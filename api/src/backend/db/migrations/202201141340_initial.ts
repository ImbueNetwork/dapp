import type { Knex } from "knex";
import { auditFields, DROP_ON_UPDATE_TIMESTAMP_FUNCTION, onUpdateTrigger, ON_UPDATE_TIMESTAMP_FUNCTION } from "../utils";


export async function up(knex: Knex): Promise<void> {

    await knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION);

    const usersTableName = "users";
    await knex.schema.createTable(usersTableName, (builder) => {
        /**
         * We need to be able to capture users who are just casually creating
         * a Project without any web3 functionality yet. So we lazily require
         * the web3 stuff only when it's necessary.
         */
        builder.increments("id", { primaryKey: true });
        builder.text("display_name");
        builder.integer("briefs_submitted").defaultTo(0);
        builder.text("getstream_token");


        auditFields(knex, builder);
    }).then(onUpdateTrigger(knex, usersTableName));

    /**
     * Without at least one of these, a usr can't really do much beyond saving
     * a draft proposal.
     */
    const web3AccountsTableName = "web3_accounts";
    await knex.schema.createTable(web3AccountsTableName, (builder) => {
        builder.text("address");
        builder.integer("user_id").notNullable();

        builder.text("type");
        builder.text("challenge");

        builder.primary(["address"]);
        builder.foreign("user_id").references("users.id");

        auditFields(knex, builder);
    }).then(onUpdateTrigger(knex, web3AccountsTableName));

    const federatedCredsTableName = "federated_credentials";
    await knex.schema.createTable(federatedCredsTableName, (builder) => {
        builder.integer("id");
        builder.text("issuer");
        builder.text("subject");
        builder.primary(["issuer", "subject"]);

        builder.foreign("id")
            .references("users.id")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");

        auditFields(knex, builder);
    }).then(onUpdateTrigger(knex, federatedCredsTableName));

    const projectStatusTableName = "project_status";
    await knex.schema.createTable(projectStatusTableName, builder => {
        builder.increments("id", { primaryKey: true });
        builder.text("status");
        auditFields(knex, builder);
    }).then(onUpdateTrigger(knex, projectStatusTableName));


    const projectsTableName = "projects";
    await knex.schema.createTable(projectsTableName, (builder: Knex.CreateTableBuilder) => {
        builder.increments("id", { primaryKey: true });
        builder.text("name"); // project name
        builder.text("logo"); // URL or dataURL (i.e., base64 encoded)
        builder.text("description");
        builder.text("website");
        builder.integer("category");
        builder.integer("currency_id");
        builder.integer("chain_project_id");
        builder.decimal("total_cost_without_fee", 10, 2);
        builder.decimal("imbue_fee", 10, 2);
        builder.integer("status_id").notNullable().defaultTo(1);
        builder.foreign("status_id")
            .references("project_status.id")
            .onDelete("SET NULL")
            .onUpdate("CASCADE");

        // milestones[]: `milstone` has a foreign key back to project.

        // TODO: contributions[] will probably have a foreign key back to
        // project.

        // This type holds numbers as big as 1e128 and beyond (incl. fractional
        // scale). The emphasis is on precision, while arithmetical efficiency
        // takes a hit.
        builder.decimal("required_funds", 10, 2).notNullable();

        // FIXME: this will need to be ACID, hence we will
        // need to update it from the blockchain.
        // builder.decimal("withdrawn_funds").defaultTo(0);

        /**
         * owner -- `AccountId` is a 32 byte array, stored as base64 encoded
         *
         * This shouldn't be null because we have to offer users the ability to
         * submit the form without having an account, to protect their privacy.
         */
        builder.text("owner");

        /**
         * This is nullable because we offer web3 account holders the ability to
         * do all of their dealings wihout an account. This means that if they
         * opt-out, they can't edit, etc., before finalization.
         *
         * This is nullable because editing is "opt-in" and we don't need an
         * account, per se, to store projects. But if/when a user wants to
         * create an account and associate it with a web3 address, we can update
         * all of the projects whose "owner" is a `web3_account` associated with
         * the `usr` account. Likewise, when a user decides to delete their
         * account, we don't CASCADE in that case -- only nullify the `user_id`
         * here, as it wouldn't point to anything useful.
         */
        builder.integer("user_id");
        builder.foreign("user_id")
            .references("users.id")
            .onUpdate("CASCADE")
            .onDelete("SET NULL");

        /**
         * Must be nullable; that's sort of the whole point, actually, and
         * like `withdrawn_funds` we'll need to update this from the chain.
         * N.B., `BlockNumber` from Substrate can be either a u32 or a byte
         * array (usually represented as Hex). But it's clearly a sequential
         * integer in terms of its use, so whatever we get we're going
         * to want to store it as an int, so we're going with bigint here
         * because postgres only has signed ints (`unsigned` is ignored).
         *
         * Once this is set, the project is regarded as "committed", but the
         * real source of truth for this value is the chain itself.
         *
         * If you can't find this on the chain and this value is null, then
         * the project should be considered in a "draft" state.
         */
        builder.bigInteger("create_block_number").nullable(); //.unsigned();

        auditFields(knex, builder);
    }).then(onUpdateTrigger(knex, projectsTableName));

    /**
     *  pub struct Milestone {
     *      project_key: ProjectIndex,
     *      milestone_index: MilestoneIndex,
     *      name: Vec<u8>,
     *      percentage_to_unlock: u32,
     *      is_approved: bool
     *  }
     */
    const milestonesTableName = "milestones";
    await knex.schema.createTable(milestonesTableName, (builder) => {
        builder.integer("milestone_index");
        builder.integer("project_id").notNullable();
        builder.primary(["project_id", "milestone_index"]);
        builder.decimal("amount");

        builder.foreign("project_id")
            .references("projects.id")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");

        builder.text("name");
        builder.integer("percentage_to_unlock");
        builder.boolean("is_approved").defaultTo(false);

        auditFields(knex, builder);
    }).then(onUpdateTrigger(knex, milestonesTableName));

    /**
     * TODO: ? votes and contributions
     *
     * It's not clear that this will ever be anything that needs to be
     * stored in the database, which for now is being thought of as a kind of
     * index or cache.
     *
     *  pub struct Vote<Balance> {
     *      yay: Balance,
     *      nay: Balance,
     *      is_approved: bool
     *  }
     *
     */
    // await knex.schema.createTable("vote", (builder) => {
    //     builder.bigIncrements("id");
    //     builder.decimal("yay");
    //     builder.decimal("nay");
    //     builder.boolean("is_approved");

    //     auditFields(knex, builder);
    // });
    // await knex.schema.createTable("project_vote_map", (builder) => {
    //     builder.integer("project_key");
    //     builder.bigInteger("vote_id");
    // });
    //
    // /**
    //  *  pub struct Contribution<AccountId, Balance> {
    //         account_id: AccountId,
    //         value: Balance,
    //     }
    //  */
    // await knex.schema.createTable("contribution", (builder) => {
    //     builder.integer("idx");
    //     // i.e., same as `owner` on `project` above.
    //     builder.string("account_id").notNullable();
    //     builder.integer("project_key").notNullable();
    //     builder.decimal("value").notNullable();
    //     builder.primary(["project_key", "account_id", "idx"]);

    //     builder.foreign("project_key")
    //         .references("project.key")
    //         .onDelete("CASCADE")
    //         .onUpdate("CASCADE");

    //     auditFields(knex, builder);
    // });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("milestones");
    await knex.schema.dropTableIfExists("projects");
    await knex.schema.dropTableIfExists("project_status");
    await knex.schema.dropTableIfExists("federated_credentials");
    await knex.schema.dropTableIfExists("web3_accounts");
    await knex.schema.dropTableIfExists("users");
    await knex.raw(DROP_ON_UPDATE_TIMESTAMP_FUNCTION);
}
