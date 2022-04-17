"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("./knexfile"));
const config_1 = __importDefault(require("../config"));
const validEnvironments = ["development", "staging", "production"];
const env = config_1.default.environment;
if (!(env && validEnvironments.includes(env))) {
    throw new Error(`Must export envvar \`NODE_ENV\` as one of: "${validEnvironments.join("\", \"")}"`);
}
exports.default = (0, knex_1.default)(knexfile_1.default[env]);
