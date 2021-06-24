const gen = require('./generarDictadosMelodicos');
const trans = require('../funcsGralDictados');

const pruebadictados = () => {
    const notasRegla = [
        ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5'],
        ['Do4', 'Mi4', 'Sol4', 'Do5'],
    ];
    const nivelPrioridadRegla = [
        { regla: 0, prioridad: 1 },
        { regla: 1, prioridad: 3 },
    ];
    const intervaloNotas = [
        { clave: 'Sol', notaMenor: 'La3', notaMayor: 'Do6' },
        { clave: 'Fa', notaMenor: 'Do2', notaMayor: 'Mi4' },
    ];
    const notasBase = ['Do4', 'Sol4'];
    const notasFin = ['Do4', 'Sol4'];
    const nivelPrioridadClave = [
        { elem: 'Sol', prioridad: 3 },
        { elem: 'Fa', prioridad: 1 },
    ];
    const cantDictado = 20;

    return gen.generarDictadoMelodico(
        notasRegla,
        nivelPrioridadRegla,
        intervaloNotas,
        notasBase,
        notasFin,
        nivelPrioridadClave
    );
};

const giros_melodicos = ['C#4', 'Db4', 'E##4', 'Fbb4', 'G4', 'A4', 'B4', 'C5'];

console.log(trans.translateNotes(trans.translateToMyNotes(giros_melodicos)));
