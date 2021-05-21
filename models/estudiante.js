const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EstudianteSchema = Schema({
    nombre: String,
    apellido: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
});

module.exports = mongoose.model('Estudiante', EstudianteSchema);
