const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Curso = require('./curso');

const EstudianteSchema = Schema({
    nombre: String,
    apellido: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    cursos_inscriptos: [{ type: mongoose.Schema.Types.ObjectId, ref: Curso }],
    dictados: [
        {
            curso: { type: mongoose.Schema.Types.ObjectId, ref: Curso },
            modulo: { type: mongoose.Schema.Types.ObjectId },
            notas: [String], // ya trducidas
            figuras: [[String]], // con compás
            clave: String,
            escala_diatonica: String,
        },
    ],
});

module.exports = mongoose.model('Estudiante', EstudianteSchema);
