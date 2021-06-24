// Datos
const SECUENCIA_ASCENDENTE = [
    'Do',
    'Do#',
    'Re',
    'Re#',
    'Mi',
    'Fa',
    'Fa#',
    'Sol',
    'Sol#',
    'La',
    'La#',
    'Si',
];
const SECUENCIA_DESCENDENTE = [
    'Si', // 0
    'La#', // 1
    'La', // 2
    'Sol#', // 3
    'Sol', // 4
    'Fa#', // 5
    'Fa', // 6
    'Mi', // 7
    'Re#', // 8
    'Re', // 9
    'Do#', // 10
    'Do', // 11
];

//Escalas Dationicas
// [ 'Fa','Do','Sol','Re','La','Mi','Si' ]
// [ 'Sol#','Reb','Sol#','Re#','La#','Mi#','Si#' ]
// [ 'Sol', 'Re','La','Mi','Si','Fa#','Do#' ]

// Intervalos
const INTERVALOS = ['2m','2M','3m','3M','4J','5J','6m','6M','7m','7M','8J'];

// Intervalos y sus nombres
const INTERVALO_SEMITONOS =
    // { nombre_intervalo : cantidad_semitonos }
    {
        '2m': 1,
        '2M': 2,
        '3m': 3,
        '3M': 4,
        '4J': 5,
        '5J': 7,
        '6m': 8,
        '6M': 9,
        '7m': 10,
        '7M': 11,
        '8J': 12,
    };
    const INTERVALO_NOMBRES =
    // { nombre_intervalo : cantidad_nombresDistintos }
    {
        '2m': 2,
        '2M': 2,
        '3m': 3,
        '3M': 3,
        '4J': 4,
        '5J': 5,
        '6m': 6,
        '6M': 6,
        '7m': 7,
        '7M': 7,
        '8J': 8,
    };


// Dirección
const DESCENDENTE = 'descendente';
const ASCENDENTE = 'ascendente';

// 5º justa
const REGLA_NUM_NOTAS = 5;
const REGLA_AVANCE = 7;

// 3º Mayor
// const REGLA_NUM_NOTAS = 3;
// const REGLA_AVANCE = 4;

const REGLA_MOV_DIATONICA = ['terceras'];

const ALTERACIONES_ESCALA_DIATONICA = [
    {
        escala: 'Do',
        alteracion: [],
    },
    {
        escala: 'Sol',
        alteracion: ['F#'],
    },
    {
        escala: 'Re',
        alteracion: ['C#', 'F#'],
    },
    {
        escala: 'La',
        alteracion: ['C#', 'F#', 'G#'],
    },
    {
        escala: 'Mi',
        alteracion: ['C#', 'F#', 'G#', 'D#'],
    },
    {
        escala: 'Si',
        alteracion: ['C#', 'F#', 'G#', 'D#', 'A#'],
    },
    {
        escala: 'Fa#',
        alteracion: ['C#', 'F#', 'G#', 'D#', 'A#', 'E#'],
    },
    {
        escala: 'Solb',
        alteracion: ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb'],
    },
    {
        escala: 'Reb',
        alteracion: ['Gb', 'Ab', 'Bb', 'Db', 'Eb'],
    },
    {
        escala: 'Lab',
        alteracion: ['Ab', 'Bb', 'Db', 'Eb'],
    },
    {
        escala: 'Mib',
        alteracion: ['Ab', 'Bb', 'Eb'],
    },
    {
        escala: 'Sib',
        alteracion: ['Bb', 'Eb'],
    },
    {
        escala: 'Fa',
        alteracion: ['Bb'],
    },
];

module.exports = {
    SECUENCIA_ASCENDENTE,
    SECUENCIA_DESCENDENTE,
    REGLA_NUM_NOTAS,
    REGLA_AVANCE,
    DESCENDENTE,
    ASCENDENTE,
    REGLA_MOV_DIATONICA,
    INTERVALO_SEMITONOS,
    INTERVALO_NOMBRES,
    INTERVALOS,
    ALTERACIONES_ESCALA_DIATONICA,
};
