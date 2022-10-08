import { Knex } from "knex";
import { auditFields, onUpdateTrigger } from "../utils";


export async function up(knex: Knex): Promise<void> {
    const tableName = "briefs";
    await knex.schema.createTable(tableName, (builder) => {
        builder.increments("id", { primaryKey: true });
        builder.text("headline");
        builder.text("industries"); 
        builder.text("description");   
        builder.text("skills");  
        builder.enu("scope",["Complex","Large","Medium","Small"]); 
        builder.enu("duration",["OneToThreeMonths","ThreeToSixMonths","MoreThan6Months","MoreThan1Year"]);  
        builder.integer("budget");

        //builder.integer("project_id").notNullable();
        //builder.foreign("project_id")
         //   .references("projects.id");

        auditFields(knex, builder);
    }).then(onUpdateTrigger(knex, tableName));
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("project_properties");
}

