const { acordeType } = require('../../enums/acordeType');
const { escalaCampoArmonico } = require('../../enums/escalaCampoArmonico');
const { nombreCifrado_TetradaTriada } = require('../../enums/nombreCifrado_TetradaTriada');

const tensionesCondicionales = [
    // CREO QUE ESTE TODO NO VA
    // TODO: Agregar que keyNote sea con las nuevas notas que cambian para las tablas de menor
    {
        escala: escalaCampoArmonico.menorArmonica,
        keyNote: 'G',
        nombreCifrado: nombreCifrado_TetradaTriada.tetrada_7,
        tension: 'b13',
        intervalo: '13m',
        intervaloProhibido: '5P',
    },
    {
        escala: escalaCampoArmonico.menorArmonica,
        keyNote: 'G',
        nombreCifrado: nombreCifrado_TetradaTriada.tetrada_7sus4,
        tension: 'b13',
        intervalo: '13m',
        intervaloProhibido: '5P',
    },
    {
        escala: escalaCampoArmonico.menorMelodica,
        keyNote: 'G',
        nombreCifrado: nombreCifrado_TetradaTriada.tetrada_7,
        tension: 'b13',
        intervalo: '13m',
        intervaloProhibido: '5P',
    },
    {
        escala: escalaCampoArmonico.menorMelodica,
        keyNote: 'G',
        nombreCifrado: nombreCifrado_TetradaTriada.tetrada_7sus4,
        tension: 'b13',
        intervalo: '13m',
        intervaloProhibido: '5P',
    }
]

const acordesJazz = [
    // TÉTRADAS
    {
        nombreCifrado: 'Maj7',
        semitonos: ['4', '7', '11'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5P', '7M'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: '7',
        semitonos: ['4', '7', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5P', '7m'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: 'm7',
        semitonos: ['3', '7', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3m', '5P', '7m'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: 'm7b5',
        semitonos: ['3', '6', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3m', '5d', '7m'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: 'mMaj7',
        semitonos: ['3', '7', '11'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3m', '5P', '7M'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: 'AugMaj7', // <<<---
        semitonos: ['4', '8', '11'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5A', '7M'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: '07', // <<<---
        semitonos: ['3', '6', '9'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3m', '5d', '7d'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: '6',
        semitonos: ['4', '7', '9'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5P', '6M'],
        prohibidasEnBajo: ['6M'],
    },
    {
        nombreCifrado: 'm6',
        semitonos: ['3', '7', '9'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3m', '5P', '6M'],
        prohibidasEnBajo: ['6M'],
    },
    {
        nombreCifrado: '7(#5)', // <<<---
        semitonos: ['4', '8', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5A', '7m'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: 'aug7', // <<<---
        semitonos: ['4', '8', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5A', '7m'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: '7(b5)',
        semitonos: ['4', '6', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5d', '7m'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: '7sus2',
        semitonos: ['2', '7', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['2M', '5P', '7m'],
        prohibidasEnBajo: ['2M'],
    },
    {
        nombreCifrado: '7sus4',
        semitonos: ['5', '7', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['4P', '5P', '7m'],
        prohibidasEnBajo: ['4P'],
    },
    {
        nombreCifrado: '6sus2',
        semitonos: ['2', '7', '9'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['2M', '5P', '6M'],
        prohibidasEnBajo: ['2M', '6M'],
    },
    {
        nombreCifrado: '6sus4',
        semitonos: ['5', '7', '9'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['4P', '5P', '6M'],
        prohibidasEnBajo: ['4P', '6M'],
    },
    {
        nombreCifrado: 'maj7sus2',
        semitonos: ['2', '7', '11'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['2M', '5P', '7M'],
        prohibidasEnBajo: ['2M'],
    },
    {
        nombreCifrado: 'maj7sus4',
        semitonos: ['5', '7', '11'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['4P', '5P', '7M'],
        prohibidasEnBajo: ['4P'],
    },
    // TRÍADAS
    {
        nombreCifrado: 'Mayor',
        semitonos: [], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5P'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: 'Menor',
        semitonos: [], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3m', '5P'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: 'Disminuido',
        semitonos: [], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3m', '5d'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: 'Aumentado',
        semitonos: [], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5A'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: 'sus2',
        semitonos: [], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['2M', '5P'],
        prohibidasEnBajo: [],
    },
    {
        nombreCifrado: 'sus4',
        semitonos: [], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['4P', '5P'],
        prohibidasEnBajo: [],
    },
];

const intervaloTensiones = [
    {
        nombre: 'Novena menor',
        codigo: 'b9',
        tipo: '9',
        intervalo: '9m',
        semitonos: 1,
        cantidadNombres: 2,
    },
    {
        nombre: 'Novena Mayor',
        codigo: '9',
        tipo: '9',
        intervalo: '9M',
        semitonos: 2,
        cantidadNombres: 2,
    },
    {
        nombre: 'Novena aumentada',
        codigo: '#9',
        tipo: '9',
        intervalo: '9A',
        semitonos: 3,
        cantidadNombres: 2,
    },
    {
        nombre: 'Oncena justa',
        codigo: '11',
        tipo: '11',
        intervalo: '11P',
        semitonos: 5,
        cantidadNombres: 4,
    },
    {
        nombre: 'Oncena aumentada',
        codigo: '#11',
        tipo: '11',
        intervalo: '11A',
        semitonos: 6,
        cantidadNombres: 4,
    },
    {
        nombre: 'Trecena menor',
        codigo: 'b13',
        tipo: '13',
        intervalo: '13m',
        semitonos: 8,
        cantidadNombres: 6,
    },
    {
        nombre: 'Trecena Mayor',
        codigo: '13',
        tipo: '13',
        intervalo: '13M',
        semitonos: 9,
        cantidadNombres: 6,
    },
]

const nombreCifrado_codigoTension_byNote = [
    // TÉTRADAS
    {
        keyNote: 'C',
        acordeType: acordeType.tetrada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: 'Maj7',
                codigosTensiones: ['9', '13']
            },
            {
                nombreCifrado: '6',
                codigosTensiones: ['9']
            },
            {
                nombreCifrado: '6sus2',
                codigosTensiones: []
            },
            {
                nombreCifrado: 'maj7sus2',
                codigosTensiones: ['13']
            },
            {
                nombreCifrado: '6sus4',
                codigosTensiones: ['9']
            },
            {
                nombreCifrado: 'maj7sus4',
                codigosTensiones: ['9']
            },
        ]
    },
    {
        keyNote: 'D',
        acordeType: acordeType.tetrada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: 'm7',
                codigosTensiones: ['9', '11']
            },
            {
                nombreCifrado: 'm6',
                codigosTensiones: ['9', '11']
            },
            {
                nombreCifrado: '6sus2',
                codigosTensiones: []
            },
            {
                nombreCifrado: '7sus2',
                codigosTensiones: []
            },
            {
                nombreCifrado: '6sus4',
                codigosTensiones: ['9']
            },
            {
                nombreCifrado: '7sus4',
                codigosTensiones: ['9']
            }
        ]
    },
    {
        keyNote: 'E',
        acordeType: acordeType.tetrada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: 'm7',
                codigosTensiones: ['11']
            },
            {
                nombreCifrado: '7sus4',
                codigosTensiones: []
            },
        ]
    },
    {
        keyNote: 'F',
        acordeType: acordeType.tetrada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: 'Maj7',
                codigosTensiones: ['9', '#11', '13']
            },
            {
                nombreCifrado: '6sus2',
                codigosTensiones: ['#11']
            },
            {
                nombreCifrado: 'maj7sus2',
                codigosTensiones: ['#11', '13']
            },
            {
                nombreCifrado: '6',
                codigosTensiones: ['9', '#11']
            },
        ]
    },
    {
        keyNote: 'G',
        acordeType: acordeType.tetrada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: '7',
                codigosTensiones: ['9', '13']
            },
            {
                nombreCifrado: '6',
                codigosTensiones: ['9']
            },
            {
                nombreCifrado: '6sus2',
                codigosTensiones: []
            },
            {
                nombreCifrado: '7sus2',
                codigosTensiones: ['13']
            },
            {
                nombreCifrado: '6sus4',
                codigosTensiones: ['9']
            },
            {
                nombreCifrado: '7sus4',
                codigosTensiones: ['9', '13']
            },
        ]
    },
    {
        keyNote: 'A',
        acordeType: acordeType.tetrada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: 'm7',
                codigosTensiones: ['9', '11']
            },
            {
                nombreCifrado: '7sus2',
                codigosTensiones: ['11']
            },
            {
                nombreCifrado: '7sus4',
                codigosTensiones: ['9']
            },
        ]
    },
    {
        keyNote: 'B',
        acordeType: acordeType.tetrada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: 'm7b5',
                codigosTensiones: ['11', 'b13']
            },
        ]
    },
    // TRÍADAS
    {
        keyNote: 'C',
        acordeType: acordeType.triada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: 'Mayor',
                codigosTensiones: ['9']
            },
            {
                nombreCifrado: 'sus2',
                codigosTensiones: []
            },
            {
                nombreCifrado: 'sus4',
                codigosTensiones: ['9']
            },
        ]
    },
    {
        keyNote: 'D',
        acordeType: acordeType.triada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: 'Menor',
                codigosTensiones: ['9', '11']
            },
            {
                nombreCifrado: 'sus2',
                codigosTensiones: []
            },
            {
                nombreCifrado: 'sus4',
                codigosTensiones: ['9']
            },
        ]
    },
    {
        keyNote: 'E',
        acordeType: acordeType.triada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: 'Menor',
                codigosTensiones: ['11']
            },
            {
                nombreCifrado: 'sus4',
                codigosTensiones: []
            },
        ]
    },
    {
        keyNote: 'F',
        acordeType: acordeType.triada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: 'Mayor',
                codigosTensiones: ['9', '#11']
            },
            {
                nombreCifrado: 'sus2',
                codigosTensiones: ['#11']
            },
        ]
    },
    {
        keyNote: 'G',
        acordeType: acordeType.triada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: 'Mayor',
                codigosTensiones: ['9']
            },
            {
                nombreCifrado: 'sus2',
                codigosTensiones: []
            },
            {
                nombreCifrado: 'sus4',
                codigosTensiones: ['9']
            },
        ]
    },
    {
        keyNote: 'A',
        acordeType: acordeType.triada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: 'Menor',
                codigosTensiones: ['9', '11']
            },
            {
                nombreCifrado: 'sus2',
                codigosTensiones: []
            },
            {
                nombreCifrado: 'sus4',
                codigosTensiones: ['9']
            },
        ]
    },
    {
        keyNote: 'B',
        acordeType: acordeType.triada,
        nombreCifrado_codigoTension: [
            {
                nombreCifrado: 'Disminuido',
                codigosTensiones: ['9', 'b13']
            },
        ]
    },
]

module.exports = {
    acordesJazz,
    intervaloTensiones,
    nombreCifrado_codigoTension_byNote,
    tensionesCondicionales,
};
