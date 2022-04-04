const { host, port, sql } = require('./config');

module.exports = {
    development: {
        client: 'mssql',
        connection: {
            server: sql.server,
            user: sql.user,
            password: sql.password,
            database: sql.database,
        },
        migrations: {
            directory: __dirname + '/data/migrations',
        },
        seeds: {
            directory: __dirname + '/data/seeds',
        },
    },

    // staging: {
    //     client: 'postgresql',
    //     connection: {
    //         database: 'my_db',
    //         user: 'username',
    //         password: 'password',
    //     },
    //     pool: {
    //         min: 2,
    //         max: 10,
    //     },
    //     migrations: {
    //         tableName: 'knex_migrations',
    //     },
    // },

    // production: {
    //     client: 'postgresql',
    //     connection: {
    //         database: 'my_db',
    //         user: 'username',
    //         password: 'password',
    //     },
    //     pool: {
    //         min: 2,
    //         max: 10,
    //     },
    //     migrations: {
    //         tableName: 'knex_migrations',
    //     },
    // },
};
