const IP_SERVER = '10.0.2.2';
// const IP_SERVER = '192.168.1.8';
// const IP_SERVER = '127.0.0.2';
const PORT_DB = 27017;
const NAME_DATABASE = 'Entrenamiento_Auditivo';
const user = 'ProyectoGrado2';
const password = 'ProyectoGrado2';
const CONECTION_STRING = `mongodb+srv://${user}:${password}@entrenamientoauditivo.s7skd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// Esto es mi cadena de conexión local (localhost)
const CONECTION_STRING_LOCAL_FRANCO = `mongodb://${IP_SERVER}:${PORT_DB}/${NAME_DATABASE}`;

module.exports = {
    IP_SERVER,
    PORT_DB,
    NAME_DATABASE,
    CONECTION_STRING,
    CONECTION_STRING_LOCAL_FRANCO,
};
