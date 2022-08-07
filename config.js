const dotenv = require('dotenv');
const asserts = require('assert');

dotenv.config();

const {
    HOST,
    PORT,
    SQL_USER,
    SQL_PASSWORD,
    SQL_DATABASE,
    SQL_SERVER,
    SQL_PORT,
    JWT_KEY,
} = process.env;

const sqlEncrypt = process.env.SQL_ENCRYPT === 'true';

asserts(HOST, 'HOST is required');
asserts(PORT, 'PORT is required');
asserts(SQL_USER, 'SQL_USER is required');
asserts(SQL_PASSWORD, 'SQL_PASSWORD is required');
asserts(SQL_DATABASE, 'SQL_DATABASE is required');
asserts(SQL_SERVER, 'SQL_SERVER is required');
asserts(SQL_PORT, 'SQL_PORT is required');
asserts(JWT_KEY, 'JWT_KEY is required');

module.exports = {
    host: HOST,
    port: PORT,
    sql: {
        user: SQL_USER,
        password: SQL_PASSWORD,
        database: SQL_DATABASE,
        server: SQL_SERVER,
        port: SQL_PORT,
        options: {
            encrypt: sqlEncrypt,
            enableArithAbort: true,
        },
    },
    jwtKey: JWT_KEY,
};
