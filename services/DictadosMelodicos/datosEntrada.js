// Notas como entrada,
// DEFINIDAS EN ESCALA --- DO ---
const NOTAS_CONFIG = [
    ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5'],
    ['Do4', 'Mi4', 'Sol4', 'Do5'],
];
// nivel va de 1 a 5 donde 1 es prioridad baja y 5 prioridad alta
// Por defecto las reglas tendrán prioridad 1 si no se les establece lo contrario
const NIVEL_PRIORIDAD_REGLA = [
    { regla: 0, prioridad: 1 },
    { regla: 1, prioridad: 3 },
];
const NIVEL_PRIORIDAD_CLAVE = [
    { elem: 'Sol', prioridad: 3 },
    { elem: 'Fa', prioridad: 1 },
];
const INTERVALO_NOTA = [
    { clave: 'Sol', notaMenor: 'La3', notaMayor: 'Do6' },
    { clave: 'Fa', notaMenor: 'Do2', notaMayor: 'Mi4' },
];

const NOTAS_REFERENCIAS = ['Do4', 'Sol4'];
const NOTAS_FIN = ['Do4', 'Sol4'];

const CANT_DICTADO = 15;

module.exports = {
    NOTAS_CONFIG,
    CANT_DICTADO,
    NOTAS_BASICAS,
    NOTAS_REFERENCIAS,
    NOTAS_FIN,
    ESCALAS_DIATONICAS,
    NIVEL_PRIORIDAD_REGLA,
    NIVEL_PRIORIDAD_CLAVE,
    INTERVALO_NOTA,
    NOTAS_ALTURA,
};
