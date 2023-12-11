const { acordeType } = require('../../enums/acordeType');
const { escalaCampoArmonico } = require('../../enums/escalaCampoArmonico');
const { estadoAcorde } = require('../../enums/estadoAcorde');
const { referenciaReglaAcorde } = require('../../enums/referenciaReglaAcorde');
const { getElemPrioridad } = require('../Dictados_FuncGral/funcionesGenerales');
const { intervaloTensiones } = require('./dataAcordesJazz');
const { generarAcordeJazz, getAcordeJazz } = require('./generadorAcordesJazz');
const { Note, Interval } = require('@tonaljs/tonal');
const { lessOrEqualThan } = require('./generadorAcordesServices');
const { funcionCampoArmonico } = require('../../enums/funcionCampoArmonico');

const checkRulesBetweenChords = (chord1, chord2) => {
    let ok = true
    if (lessOrEqualThan(chord1[0], chord2[0])) {
        // mayor - menor
        ok = ok && Interval.add(Interval.distance(chord2[0], chord1[0]), '8P').charAt(0) != '-'
    } else {
        ok = ok && Interval.add(Interval.distance(chord1[0], chord2[0]), '8P').charAt(0) != '-'
    }

    // if (!ok) console.log('Primer nota de acordes mas de 8P')

    if (lessOrEqualThan(chord1[chord1.length - 1], chord2[chord2.length - 1])) {
        // mayor - menor
        ok = ok && Interval.add(Interval.distance(chord2[chord2.length - 1], chord1[chord1.length - 1]), '6M').charAt(0) != '-'
    } else {
        ok = ok && Interval.add(Interval.distance(chord1[chord1.length - 1], chord2[chord2.length - 1]), '6M').charAt(0) != '-'
    }

    // if (!ok) console.log('Ultima nota de acordes mas de 6M')

    return ok;
}

/**
 * 
 * @param {boolean} isChordTarget 
 * @param {boolean} shouldHaveDominante 
 * @param {boolean} shouldHaveSubDominante 
 * @returns [enum funcionCampoArmonico]
 */
const getFuncionCampoArmonico = (isChordTarget, shouldHaveDominante, shouldHaveSubDominante) => {
    let res = []
    if (shouldHaveDominante) {
        res.push(funcionCampoArmonico.dominante)
        if (!isChordTarget) {
            res.push(funcionCampoArmonico.dominanteNoTonizar)
        }
    } else {
        if (shouldHaveSubDominante) {
            res.push(funcionCampoArmonico.subdominante)
            if (!isChordTarget) {
                res.push(funcionCampoArmonico.subdominanteNoTonizar)
            }
        } else {
            if (isChordTarget) {
                res.push(funcionCampoArmonico.tonica)
            } else {
                for (const key in funcionCampoArmonico) {
                    res.push(funcionCampoArmonico[key])
                }
            }
        }        
    }

    return res;
}

/**
 * 
 * @param {{escala: string, keyNote: string}} context ex: {escala: 'Mayor', keyNote: 'C'}
 * @returns {string}
 */
const getFrom = (context) => {
    return context.escala + '|' + context.keyNote;
}

/**
 * 
 * @param {object} dataCamposArmonicos 
 * @param {int} nivel ex: 1
 * @param {[funcionCampoArmonico]} funcionesCA [funcionCampoArmonico.tonica]
 * @param {string} from ex: 'Mayor|C'
 * @param {boolean} isChordTarget ex: true
 * @returns {object} ex: dataCamposArmonicos
 */
const getDataCamposArmonicosWithTonicalizacion = (dataCamposArmonicos, nivel, funcionesCA, from, isChordTarget) => {
    let result = null
    if (nivel == 0) {
        result = dataCamposArmonicos.filter(x => x.Nivel == nivel && funcionesCA.includes(x.Funcion) && x.From == '')
    } else {
        result = dataCamposArmonicos.filter(x => x.Nivel == nivel && funcionesCA.includes(x.Funcion) && x.From == from)
    }

    if (isChordTarget) {
        return result.filter(x => x.Tonicalizado)
    }
    
    return result;
}

const generarDictadoArmonicoJazzConTonicalizacion = (
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

    let dictationScheme = []
    let dictation = []
    let dictationSchemeToSave = []
    for (let i = 0; i < numberOfChords; i++) {
        dictation.push(null);
    }
    // Check si hay algun dato en campo armonico con tonicalizado = true
    let existTonicalizado = dataCamposArmonicos.findIndex(x => x.Tonicalizado) > -1;
    for (var i = 0; i < numberOfChords; i++) {
        if (i < 3 || !existTonicalizado || dictationScheme[i - 1] || dictationScheme[i - 2]) {
            dictationScheme.push(false)
        } else {
            let res = false;
            const rdm = Math.floor(Math.random() * 10000 + 1); // nro random de 4 cifras
            if (rdm % 4 == 0) res = true
            
            dictationScheme.push(res)
        }
        dictationSchemeToSave.push('')
    }

    let shouldHaveDominante = false;
    let shouldHaveSubDominante = false;
    let nivel = 0
    let tries = 0
    do {
        let index = (dictationScheme.length - 1) - dictation.filter(x => x != null).length;

        let chord = null;
        if (dictation.filter(x => x != null).length == 0) {
            // Last chord -> always nivel = 0
            chord = getAcordeJazz(dataCamposArmonicosFin, newTonality, null)
        } else {
            const chordAux = dictation[index + 1].acorde
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

            if (dictation.filter(x => x != null).length == numberOfChords - 1) {
                // First chord
                chord = getAcordeJazz(dataCamposArmonicosInicio, newTonality, null, newIntervalLower, newIntervalHigher)
            } else {
                const funcionesCA = getFuncionCampoArmonico(dictationScheme[index], shouldHaveDominante, shouldHaveSubDominante)
                let paramFrom = !shouldHaveDominante && shouldHaveSubDominante ? getFrom(dictation[index + 2].context) : getFrom(dictation[index + 1].context);
                const dataCamposArmonicosWithLevel = getDataCamposArmonicosWithTonicalizacion(dataCamposArmonicos, nivel, funcionesCA, paramFrom, dictationScheme[index])
                if (dataCamposArmonicosWithLevel.length == 0) console.log('ERROR... No hay dataCampoArmonico para tonicalizado')
                chord = getAcordeJazz(dataCamposArmonicosWithLevel, newTonality, null, newIntervalLower, newIntervalHigher)
            }
        }

        if (!chord || !chord.acorde) {
            console.log('///////////////////////////////////////////////// Acorde mal.')
            console.log(chord)
            tries ++
        } else {
            if (dictation.filter(x => x != null).length && !checkRulesBetweenChords(dictation[index + 1].acorde, chord.acorde)) {
                tries ++
            } else {
                let typeChord = dictationScheme[index] ? 'Tonicalizado' : shouldHaveDominante ? 'Dominante' : shouldHaveSubDominante ? 'Subdominante' : 'Normal'
                dictationSchemeToSave[index] = typeChord + '|' + nivel.toString()
                // Chord OK 
                if (dictationScheme[index]) {
                    // Acorde target -> usar tabla en las dos anteriores
                    shouldHaveDominante = true
                    shouldHaveSubDominante = true
                    nivel ++
                } else if (shouldHaveDominante) {
                    shouldHaveDominante = false;
                } else if (shouldHaveSubDominante) {
                    shouldHaveSubDominante = false;
                    nivel = 0;
                }
                
                dictation[index] = chord
            }
        }
    } while (tries < 75 && dictation.filter(x => x != null).length < numberOfChords);

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
            referenceChord: getAcordeJazz(dataCamposArmonicosReferencia, newTonality, null),
            dictationScheme: dictationSchemeToSave
        }
    }

};

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
    generarDictadoArmonicoJazzConTonicalizacion,
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