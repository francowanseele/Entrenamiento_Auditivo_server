const { acordeType } = require('../../enums/acordeType');
const { escalaCampoArmonico } = require('../../enums/escalaCampoArmonico');
const { estadoAcorde } = require('../../enums/estadoAcorde');
const { referenciaReglaAcorde } = require('../../enums/referenciaReglaAcorde');
const { getElemPrioridad } = require('../Dictados_FuncGral/funcionesGenerales');
const { intervaloTensiones } = require('./dataAcordesJazz');
const { generarAcordeJazz, getAcordeJazz } = require('./generadorAcordesJazz');
const { Note, Interval } = require('@tonaljs/tonal');
const { lessOrEqualThan } = require('./generadorAcordesServices');

const checkRulesBetweenChords = (chord1, chord2) => {
    let ok = true
    if (lessOrEqualThan(chord1[0], chord2[0])) {
        // mayor - menor
        ok = ok && Interval.add(Interval.distance(chord2[0], chord1[0]), '8P').charAt(0) != '-'
    } else {
        ok = ok && Interval.add(Interval.distance(chord1[0], chord2[0]), '8P').charAt(0) != '-'
    }

    if (lessOrEqualThan(chord1[chord1.length - 1], chord2[chord2.length - 1])) {
        // mayor - menor
        ok = ok && Interval.add(Interval.distance(chord2[chord2.length - 1], chord1[chord1.length - 1]), '6M').charAt(0) != '-'
    } else {
        ok = ok && Interval.add(Interval.distance(chord1[chord1.length - 1], chord2[chord2.length - 1]), '6M').charAt(0) != '-'
    }

    return ok;
}

const generarDictadoArmonicoJazz = (
    dataCamposArmonicos,
    dataCamposArmonicosInicio,
    dataCamposArmonicosFin,
    dataCamposArmonicosReferencia,
    tonality,
    numberOfChords
) => {    
    // get tonality
    const tonalitySelected = getElemPrioridad(tonality);
    const newTonality = [{ elem: tonalitySelected, prioridad: 1 }]

    let tries = 0
    let dictation = []
    do {
        let chord = null;
        if (dictation.length == 0) {
            // First chord
            chord = getAcordeJazz(dataCamposArmonicosInicio, newTonality, null)
        } else {
            const chordAux = dictation[dictation.length - 1].acorde
            const lowerNote = chordAux[0]
            const higherNote = chordAux[chordAux.length - 1]

            const newIntervalLower = {
                lower: Note.transpose(lowerNote, '-8P'),
                higher: Note.transpose(lowerNote, '8P')
            }
            const newIntervalHigher = {
                lower: Note.transpose(higherNote, '-6M'),
                higher: Note.transpose(higherNote, '6M')
            }

            if (dictation.length == numberOfChords - 1) {
                // Last chord
                chord = getAcordeJazz(dataCamposArmonicosFin, newTonality, null, newIntervalLower, newIntervalHigher)
            } else {
                chord = getAcordeJazz(dataCamposArmonicos, newTonality, null, newIntervalLower, newIntervalHigher)
            }
        }

        if (!chord || !chord.acorde) {
            console.log('///////////////////////////////////////////////// Acorde mal.')
            console.log(chord)
            tries ++
        } else {
            if (dictation.length && !checkRulesBetweenChords(dictation[dictation.length - 1].acorde, chord.acorde)) {
                // console.log('///////////////////////////////////////////////// WRONG... intervals between consecutive chords');
                // console.log(dictation[dictation.length - 1].acorde);
                // console.log(chord.acorde);
                // console.log('/////////////////////////////////////////////////');
                tries ++
            } else {
                dictation.push(chord)
            }
        }
    } while (tries < 75 && dictation.length < numberOfChords);

    if (tries >= 75) {
        console.log('/////////////////////////////////////////////////');
        console.log('Max tries');
        console.log('Dictation');
        console.log(dictation)
        console.log('-------------------------------------------------');
        console.log(dataCamposArmonicos);
        console.log(tonality);
        console.log(numberOfChords);
        console.log('/////////////////////////////////////////////////');

        return null;
    } else {
        return {
            dictation: dictation,
            referenceChord: getAcordeJazz(dataCamposArmonicosReferencia, newTonality, null)
        }
    }

};

module.exports = {
    generarDictadoArmonicoJazz,
}

// const dataCamposArmonicos = [
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'C',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Maj7',
//       Tension: '9, 13',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'C',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Mayor',
//       Tension: 'add 9',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'D',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'm7',
//       Tension: '9, 11',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'D',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Menor',
//       Tension: 'add 9, 11',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'E',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'm7',
//       Tension: '11',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'E',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Menor',
//       Tension: 'add 11',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'F',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Maj7',
//       Tension: '9, #11, 13',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'F',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Mayor',
//       Tension: 'add 9, #11',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'G',
//       KeyNotePrioridad: 1,
//       NombreCifrado: '7',
//       Tension: '9, 13',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'G',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Mayor',
//       Tension: 'add 9',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'A',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'm7',
//       Tension: '9, 11',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'A',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Menor',
//       Tension: 'add 9, 11',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'B',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'm7b5',
//       Tension: '11, b13',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Mayor',
//       EscalaPrioridad: 1,
//       KeyNote: 'B',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Disminuido',
//       Tension: 'add 9, b13',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'C',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'AugMaj7',
//       Tension: '9',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'C',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Aumentado',
//       Tension: 'add 9',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'D',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'm7',
//       Tension: '9, #11, 13',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'D',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Menor',
//       Tension: 'add 9, #11',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'E',
//       KeyNotePrioridad: 1,
//       NombreCifrado: '7',
//       Tension: 'b9, b13',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'E',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Mayor',
//       Tension: 'add b9',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'F',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Maj7',
//       Tension: '#9, #11, 13',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'F',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Mayor',
//       Tension: 'add #9, #11',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'G#',
//       KeyNotePrioridad: 1,
//       NombreCifrado: '07',
//       Tension: 'b13',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'G#',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Disminuido',
//       Tension: '',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'A',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'mMaj7',
//       Tension: '9, 11',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'A',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Menor',
//       Tension: 'add 9, 11',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'B',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'm7b5',
//       Tension: '11',
//       Tipo: 0,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     },
//     {
//       Escala: 'Menor Armónica',
//       EscalaPrioridad: 1,
//       KeyNote: 'B',
//       KeyNotePrioridad: 1,
//       NombreCifrado: 'Disminuido',
//       Tension: 'add 11',
//       Tipo: 1,
//       ConfiguracionAcordeJazzId: 28,
//       EstadosAcorde: '0'
//     }
// ]
// const tonality = [{ elem: 'Do', prioridad: 1 }]
// const referenceRule = referenciaReglaAcorde.fundamental

// console.log(generarDictadoArmonicoJazz(dataCamposArmonicos, dataCamposArmonicos, dataCamposArmonicos, dataCamposArmonicos, tonality, 5))