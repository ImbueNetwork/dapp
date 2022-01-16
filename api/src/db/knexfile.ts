// Update with your config settings.

export default {

  development: {
    client: "postgresql",
    connection: {
      host: "127.0.0.1",
      port: 55432,
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
