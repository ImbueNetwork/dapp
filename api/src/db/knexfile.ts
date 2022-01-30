// Update with your config settings.
export default {

  development: {
    client: "postgresql",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT) || 5433,
      database: "imbue",
      user: "imbue",
      password: "imbue"
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
      database: "imbue",
      user: "imbue",
      password: "imbue"
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
      database: "imbue",
      user: "imbue",
      password: "imbue"
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
