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

    staging: {
        client: 'pg',
        connection: {
            host: sql.server,
            port: sql.port,
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

    production: {
        client: 'pg',
        connection: {
            host: sql.server,
            port: sql.port,
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
};
