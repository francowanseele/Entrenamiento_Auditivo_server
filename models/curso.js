const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Usuario = require('./usuario');

const generateObjectId = () => {
    var ObjectId = mongoose.Types.ObjectId;
    return new ObjectId();
};

const CursoSchema = Schema({
    nombre: String,
    descripcion: String,
    personal: Boolean,
    modulo: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: generateObjectId,
            },
            nombre: String,
            descripcion: String,
            configuracion_dictado: [
                {
                    // Configuraciones generales
                    _id: {
                        type: mongoose.Schema.Types.ObjectId,
                        default: generateObjectId,
                    },
                    creado: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: Usuario,
                    },
                    nombre: String,
                    descripcion: String,
                    // Configuraciones dictado melódico
                    giro_melodico_regla: [
                        {
                            giros_melodicos: [String],
                            prioridad: Number,
                        },
                    ],
                    tesitura: [
                        {
                            clave: String,
                            nota_menor: String,
                            nota_mayor: String,
                        },
                    ],
                    notas_inicio: [String],
                    notas_fin: [String],
                    clave_prioridad: [
                        {
                            clave: String,
                            prioridad: Number,
                        },
                    ],
                    escala_diatonica_regla: [
                        {
                            escala_diatonica: String,
                            prioridad: Number,
                        },
                    ],
                    // Configuraciones dictado rítmico
                    celula_ritmica_regla: [
                        {
                            celula_ritmica: String,
                            simple: Boolean,
                            prioridad: Number,
                        },
                    ],
                    nro_compases: Number,
                    compas_regla: [
                        {
                            numerador: Number,
                            denominador: Number,
                            simple: Boolean,
                            prioridad: Number,
                        },
                    ],
                    simple: Boolean,
                    nota_base: String,
                    bpm: {
                        menor: Number,
                        mayor: Number,
                    },
                    dictado_ritmico: Boolean,
                },
            ],
        },
    ],
});

module.exports = mongoose.model('Curso', CursoSchema);
