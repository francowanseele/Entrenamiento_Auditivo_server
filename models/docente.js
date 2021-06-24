const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Curso = require('./curso');
const Instituto = require('./instituto');

const DocenteSchema = Schema({
    nombre: String,
    apellido: String,
    email: String,
    password: String,
    dictado_curso: [{ type: mongoose.Schema.Types.ObjectId, ref: Curso }],
    instituto: [{ type: mongoose.Schema.Types.ObjectId, ref: Instituto }],
    habilitado: Boolean,
});

module.exports = mongoose.model('Docente', DocenteSchema);
