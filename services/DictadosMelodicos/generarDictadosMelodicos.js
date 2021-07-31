const gral = require('../Dictados_FuncGral/funcionesGenerales');
const cte_dictados = require('./constants');
const transformar = require('./transformarEscala');
const dictado = require('./generarDictado');
const funcsGeralDictado = require('../funcsGralDictados');

/* 
**********************************
******* EJEMPLO DE ENTRADA *******
**********************************

const data = {
    notasRegla: [
        ['Do4', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4', 'Si4', 'Do5'],
        ['Do4', 'Mi4', 'Sol4', 'Do5'],
    ],
    nivelPrioridadRegla: [
        { regla: 0, prioridad: 1 },
        { regla: 1, prioridad: 3 },
    ],
    intervaloNotas: [
        { clave: 'Sol', notaMenor: 'La3', notaMayor: 'Do6' },
        { clave: 'Fa', notaMenor: 'Do2', notaMayor: 'Mi4' },
    ],
    notasBase: ['Do4', 'Sol4'],
    notasFin: ['Do4', 'Sol4'],
    nivelPrioridadClave: [
        { elem: 'Sol', prioridad: 3 },
        { elem: 'Fa', prioridad: 1 },
    ],
    cantDictado: 10,
};
*/
const generarDictadoMelodico = (
    notasRegla,
    nivelPrioridadRegla,
    intervaloNotas,
    notasBase,
    notasFin,
    nivelPrioridadClave,
    cantDictado,
    escalaDiatonicaRegla
) => {
    // Notas de comienzo y fin
    const notaBase = gral.getRandom(notasBase);
    const notaFin = gral.getRandom(notasFin);

    // Clave del dictado (Sol/Fa)
    const clave = gral.getElemPrioridad(nivelPrioridadClave);

    // ---------------------------------------------------------------------
    // console.log('--------------------------------');
    // console.log('CLAVE : ');
    // console.log(clave);
    // console.log('--------------------------------');
    // ---------------------------------------------------------------------

    // Intervalo en el que se tiene que generar en dictado (entre notaMayor y notaMenor)
    var notaMayor = null;
    var notaMenor = null;
    intervaloNotas.forEach((intervalo) => {
        if (intervalo.clave == clave) {
            notaMenor = intervalo.notaMenor;
            notaMayor = intervalo.notaMayor;
        }
    });
    if (notaMenor == null || notaMayor == null) {
        return [
            false,
            'Error en establecer el intervalo (notaMenor y notaMayor).',
        ];
    }

    var escalasDiatonicasDato = cte_dictados.ESCALAS_DIATONICAS;
    var notasTransformadas = []; // notasRegla transformadas a una escala diatónica
    var modificarAltura = null; // cuantas alturas debo modificar las notas para que entre dentro del intervalo
    var escalaDiatonicaRegla_var = escalaDiatonicaRegla;

    // Pruebo transformar a las notas de configuración a diferentes escálas diatónicas
    // y ver si caen dentro del intervalo de notas dado
    do {
        var escalaDiatonicaRDM = gral.getElemPrioridad(
            escalaDiatonicaRegla_var
        );
        notasTransformadas = transformar.transformarNotasAEscalaDiatonica(
            notasRegla,
            escalaDiatonicaRDM
        );

        modificarAltura = transformar.cuantasModificar(
            notasTransformadas,
            notaMenor,
            notaMayor
        );

        if (modificarAltura == null) {
            escalaDiatonicaRegla_var = gral.removeItemFromArrRegla(
                escalaDiatonicaRegla_var,
                escalaDiatonicaRDM
            );
        }
    } while (modificarAltura == null && escalaDiatonicaRegla_var.length > 0);

    // ---------------------------------------------------------------------
    // console.log('--------------------------------');
    // console.log('Escala diatónica: ');
    // console.log(escalaDiatonicaRDM);
    // console.log('--------------------------------');
    // ---------------------------------------------------------------------

    // Muevo las notasRegla (notasTransformadas) para que caigan dentro del intervalo
    if (modificarAltura != null) {
        notasTransformadas = transformar.modificarAlturaNotas(
            notasTransformadas,
            modificarAltura
        );
    } else {
        return [
            false,
            'No se puede generar un dictado en el intervalo dado (notaMenor y notaMayor).',
        ];
    }

    // ---------------------------------------------------------------------
    // console.log('--------------------------------');
    // console.log('Notas regla normal');
    // console.log(notasRegla);
    // console.log('Notas regla transformadas: ');
    // console.log(notasTransformadas);
    // console.log('--------------------------------');
    // ---------------------------------------------------------------------

    var notaBaseTransformada = transformar.transformarAEscalaDiatonica(
        [notaBase],
        escalaDiatonicaRDM
    )[0];
    var notaFinTransformada = transformar.transformarAEscalaDiatonica(
        [notaFin],
        escalaDiatonicaRDM
    )[0];

    // Muevo las nota base y fin dentro del intervalo
    notaBaseTransformada = transformar.modificarAlturaNotas(
        [[notaBaseTransformada]],
        modificarAltura
    )[0][0];
    notaFinTransformada = transformar.modificarAlturaNotas(
        [[notaFinTransformada]],
        modificarAltura
    )[0][0];

    // ---------------------------------------------------------------------
    // console.log('--------------------------------');
    // console.log('Notas comienzo y fin: ');
    // console.log(notaBaseTransformada);
    // console.log(notaFinTransformada);
    // console.log('--------------------------------');
    // ---------------------------------------------------------------------

    const dictadoGenerado = dictado.generarDictado(
        notasTransformadas,
        notaBaseTransformada,
        notaFinTransformada,
        cantDictado,
        notasTransformadas,
        nivelPrioridadRegla,
        0
    );
    if (!dictadoGenerado) {
        return [false, 'Dictado null'];
    }
    if (dictadoGenerado.length == 0) {
        return [false, 'Dictado generado vacío.'];
    }

    const configDictado = {
        notasRegla: notasRegla,
        notaInicio: notaBase,
        notaFin: notaFin,
        clave: clave,
        largo: cantDictado,
        escalaDiatonica: escalaDiatonicaRDM,
        notasRegla_Transform: notasTransformadas,
        notaInicio_Transform: notaBaseTransformada,
        notaFin_Transform: notaFinTransformada,
    };

    let dictadoGeneradoTraducido =
        funcsGeralDictado.translateNotes(dictadoGenerado);

    return [
        true,
        dictadoGeneradoTraducido,
        clave,
        escalaDiatonicaRDM,
        dictadoGenerado, // Lo devuelvo a modo de control
    ];
};

module.exports = {
    generarDictadoMelodico,
};
