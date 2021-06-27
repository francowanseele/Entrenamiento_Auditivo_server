const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Curso = require('./curso');
const Instituto = require('./instituto');

const UsuarioSchema = Schema({
    nombre: String,
    apellido: String,
    email: String,
    password: String,
    esDocente: Boolean,
    curso_personal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Curso',
    },
    cursa_curso: [
        {
            curso_cursado: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Curso',
            },
            fecha_inscripcion: Date,
        },
    ],
    dicta_curso: [
        {
            curso: { type: mongoose.Schema.Types.ObjectId, ref: 'Curso' },
            responsable: Boolean,
        },
    ],
    pertenece_instituto: [
        {
            instituto: { type: mongoose.Schema.Types.ObjectId, ref: Instituto },
            habilitado: Boolean,
        },
    ],
    dictados: [
        {
            curso: { type: mongoose.Schema.Types.ObjectId, ref: 'Curso' },
            modulo: { type: mongoose.Schema.Types.ObjectId },
            configuracion_dictado: { type: mongoose.Schema.Types.ObjectId },
            fecha_generado: Date,
            notas: [String], // ya trducidas
            figuras: [[String]], // con compás
            clave: String,
            escala_diatonica: String,
            nota_base: String,
            numerador: Number,
            denominador: Number,
            resuelto: [
                {
                    fecha: Date,
                    nota: Number,
                },
            ],
        },
    ],
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
