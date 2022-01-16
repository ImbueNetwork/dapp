import type { Knex } from "knex";
import { auditFields } from "../utils";


export async function up(knex: Knex): Promise<void> {

    await knex.schema.createTable("usr", (builder) => {
        /**
         * We need to be able to capture users who are just casually creating
         * a Project without any web3 functionality yet. So we lazily require
         * the web3 stuff only when it's necessary.
         */
        builder.increments("id", { primaryKey: true });
        builder.text("display_name").notNullable();

        /**
         * A User will ultimately need the `web3_account_id` to do anything on
         * the chain.
         */
        builder.binary("web3_account_id").nullable().unique();

        auditFields(knex, builder);
    });

    // await knex.schema.createTable("web3_account", (builder) => {
    //     builder.binary("id");
    //     builder.primary(["id"]);
    //     builder.foreign("id").references("usr.web3_account_id");

    //     auditFields(knex, builder);
    // });

    await knex.schema.createTable("federated_credential", (builder) => {
        builder.integer("id");
        builder.text("issuer");
        builder.text("subject");
        builder.primary(["issuer", "subject"]);

        builder.foreign("id")
            .references("usr.id")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");
    });

    /**
     *  pub struct Project<AccountId, Balance, BlockNumber> {
     *      name: Vec<u8>,
     *      logo: Vec<u8>,
     *      description: Vec<u8>,
     *      website: Vec<u8>,
     *      milestones: Vec<Milestone>,
     *      contributions: Vec<Contribution<AccountId, Balance>>,
     *      required_funds: Balance,
     *      withdrawn_funds: Balance,
     *      /// The account that will receive the funds if the campaign is successful
     *      owner: AccountId,
     *      create_block_number: BlockNumber,
     *  }
     */
    await knex.schema.createTable("project", (builder: Knex.CreateTableBuilder) => {
        builder.increments("id");
        builder.text("name"); // project name
        builder.text("logo"); // URL or dataURL (i.e., base64 encoded)
        builder.text("description");
        builder.text("website");
        // milestones[]: `milstone` has a foreign key back to project.
        
        // TODO: contributions[] will probably have a foreign key back to
        // project.

        // This type holds numbers as big as 1e128 and beyond (incl. fractional
        // scale). The emphasis is on precision, while arithmetical efficiency
        // takes a hit.
        builder.decimal("required_funds", null).notNullable();
        
        // FIXME: this will need to be ACID, hence we will
        // need to update it from the blockchain.
        // builder.decimal("withdrawn_funds").defaultTo(0);

        // owner -- `AccountId`
        // `AccountId` is a 32 byte array
        builder.binary("owner").notNullable();

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
        builder.bigInteger("create_block_number")//.unsigned();

        builder.integer("usr_id").notNullable();
        builder.foreign("usr_id")
            .references("usr.id")
            .onUpdate("CASCADE")
            .onDelete("CASCADE");

        auditFields(knex, builder);
    });

    /**
     *  pub struct Milestone {
     *      project_key: ProjectIndex,
     *      milestone_index: MilestoneIndex,
     *      name: Vec<u8>,
     *      percentage_to_unlock: u32,
     *      is_approved: bool
     *  }
     */
    await knex.schema.createTable("milestone", (builder) => {
        builder.integer("milestone_index");
        builder.integer("project_key").notNullable();
        builder.primary(["project_key","milestone_index"]);
        builder.foreign("project_key")
            .references("project.id")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");

        builder.text("name");
        builder.integer("percentage_to_unlock");
        builder.boolean("is_approved");

        auditFields(knex, builder);
    });

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
    await knex.schema.dropTableIfExists("milestone");
    await knex.schema.dropTableIfExists("project");
    await knex.schema.dropTableIfExists("federated_credential");
    // await knex.schema.dropTableIfExists("web3_account");
    await knex.schema.dropTableIfExists("usr");
}
