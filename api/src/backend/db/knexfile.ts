// Update with your config settings.
export default {

  development: {
    client: "postgresql",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT) || 5433,
      database: process.env.DB_NAME || "imbue",
      user: process.env.DB_USER || "imbue",
      password: process.env.DB_PASSWORD || "imbue"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  // host:port default to localhost:5432 for prod and staging
  staging: {
    client: "postgresql",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT) || 5433,
      database: process.env.DB_NAME || "imbue",
      user: process.env.DB_USER || "imbue",
      password: process.env.DB_PASSWORD || "imbue"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  production: {
    client: "postgresql",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT) || 5433,
      database: process.env.DB_NAME || "imbue",
      user: process.env.DB_USER || "imbue",
      password: process.env.DB_PASSWORD || "imbue"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }

};
