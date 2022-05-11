// //const IP_SERVER = '10.0.2.2';
// const IP_SERVER = 'localhost';
// const PORT_DB = 27017;
// const NAME_DATABASE = 'Entrenamiento_Auditivo';
// const user = 'ProyectoGrado2';
// const password = 'ProyectoGrado2';
// const CONECTION_STRING = `mongodb+srv://${user}:${password}@entrenamientoauditivo.s7skd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// // Esto es mi cadena de conexión local (localhost)
// const CONECTION_STRING_LOCAL_FRANCO = `mongodb://${IP_SERVER}:${PORT_DB}/${NAME_DATABASE}`;

// module.exports = {
//     IP_SERVER,
//     PORT_DB,
//     NAME_DATABASE,
//     CONECTION_STRING,
//     CONECTION_STRING_LOCAL_FRANCO,
// };

const dotenv = require('dotenv');
const asserts = require('assert');

dotenv.config();

const { HOST, PORT, SQL_USER, SQL_PASSWORD, SQL_DATABASE, SQL_SERVER } =
    process.env;

const sqlEncrypt = process.env.SQL_ENCRYPT === 'true';

asserts(HOST, 'HOST is required');
asserts(PORT, 'PORT is required');
asserts(SQL_USER, 'SQL_USER is required');
asserts(SQL_PASSWORD, 'SQL_PASSWORD is required');
asserts(SQL_DATABASE, 'SQL_DATABASE is required');
asserts(SQL_SERVER, 'SQL_SERVER is required');

module.exports = {
    host: HOST,
    port: PORT,
    sql: {
        user: SQL_USER,
        password: SQL_PASSWORD,
        database: SQL_DATABASE,
        server: SQL_SERVER,
        options: {
            encrypt: sqlEncrypt,
            enableArithAbort: true,
        },
    },
};
