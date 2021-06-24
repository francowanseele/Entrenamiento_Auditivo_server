const IP_SERVER = 'localhost';
const PORT_DB = 27017;
const NAME_DATABASE = 'Entrenamiento_Auditivo';
const user = 'ProyectoGrado';
const password = 'ProyectoGrado';
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
