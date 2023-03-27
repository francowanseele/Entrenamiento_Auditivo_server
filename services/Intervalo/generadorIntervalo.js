const { direccionIntervalo } = require('../../enums/direccionIntervalo');
const { tipoIntervalo } = require('../../enums/tipoIntervalo');
const { getRandom, removeAllItemsFromArr, subtractArrays, getElemPrioridad } = require('../Dictados_FuncGral/funcionesGenerales');
const { NOTAS_RANGO_SOL, NOTAS_RANGO_FA } = require('./datosIntervalos');
const { Note, Interval, interval } = require('@tonaljs/tonal');
const { lessOrEqualThan } = require('../Armonia/generadorAcordesServices');


const isNotesInRange = (n1, n2, lowerNote, higherNote) => {
    return lessOrEqualThan(n1, higherNote) 
        && lessOrEqualThan(n2, higherNote)
        && lessOrEqualThan(lowerNote, n1)
        && lessOrEqualThan(lowerNote, n2);
}

/**
 * 
 * @param {{PrioridadClaveSol: int, PrioridadClaveFa: int, Tipo: tipoIntervalo, Direccion: direccionIntervalo }} data 
 * @param {[{ Intervalo: string, Prioridad: int }]} intervalos 
 */
const getInterval = (data, intervalos) => {
    // Get escala -> Sol/Fa based on priority
    const clavePriority = [
        {
            elem: 'Sol',
            prioridad: data.PrioridadClaveSol,
        },
        {
            elem: 'Fa',
            prioridad: data.PrioridadClaveFa,
        }
    ];
    const clave = getElemPrioridad(clavePriority);

    // Get type -> Melódico/Armónico
    let tipo = data.Tipo;
    if (data.Tipo == tipoIntervalo.ambos) {
        tipo = getRandom([tipoIntervalo.melodico, tipoIntervalo.armonico]);
    }

    // Get direction -> Ascendente/Descendente
    let direccion = data.Direccion;
    if (data.Direccion == direccionIntervalo.ambas) {
        direccion = getRandom([direccionIntervalo.ascendente, direccionIntervalo.descendente]);
    }

    // Get interval -> based on priority
    let intervalo = getElemPrioridad(intervalos.map((x) => { return { elem: x.Intervalo, prioridad: x.Prioridad } }));
    if (direccion == direccionIntervalo.descendente) {
        intervalo = '-' + intervalo;
    }

    // Get random note and calculate interval
    let notas = clave == 'Sol' ? NOTAS_RANGO_SOL : NOTAS_RANGO_FA;
    const higherNote = notas[notas.length - 1];
    const lowerNote = notas[0];
    let ok = false;
    let nota = '';
    let nota2 = '';

    do {
        nota = getRandom(notas);
        nota2 = Note.transpose(nota, intervalo);

        ok = isNotesInRange(nota, nota2, lowerNote, higherNote);

        // remove note so next time try with different note
        notas = removeAllItemsFromArr(notas, nota);
        
    } while (!ok && notas.length > 0);

    if (ok) {
        return {
            notaReferencia: nota,
            notas: nota + ',' + nota2,
            clave: clave,
            intervalo: intervalo,
            direccion: direccion,
            tipo: tipo,
        };
    } else {
        return null;
    }
}

module.exports = {
    getInterval,
};


// console.log(getInterval(
//     {PrioridadClaveSol: 1, PrioridadClaveFa: 1, Tipo: tipoIntervalo.ambos, Direccion: direccionIntervalo.ambas },
//     [
//         { Intervalo: '8P', Prioridad: 3 },
//         { Intervalo: '5P', Prioridad: 1 }
//     ]
// ));