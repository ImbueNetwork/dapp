import knex from "knex";
import knexfile from "./knexfile";
import config from "../config";


const validEnvironments = ["development", "staging", "production"];
const env = config.environment;

if (!(env && validEnvironments.includes(env))) {
    throw new Error(
        `Must export envvar \`NODE_ENV\` as one of: "${validEnvironments.join("\", \"")}"`
    );
}

type DBEnvironment = "development" | "staging" | "production";
export default knex(knexfile[env as DBEnvironment]);
