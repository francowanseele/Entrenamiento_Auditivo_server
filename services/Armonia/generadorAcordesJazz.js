const { Note, Interval } = require('@tonaljs/tonal');
const { getHigherNote, getLowerNote, voices } = require('../../enums/voicesJazz');
const { getRandom, removeAllItemsFromArr, subtractArrays, getElemPrioridad } = require('../Dictados_FuncGral/funcionesGenerales');
const { logError } = require('../errorService');
const { ALTERACIONES_ESCALA_DIATONICA } = require('../EscalasDiatonicas/datosAngloSaxonNomenclature');
const { transformarAEscalaDiatonica, applyAlteraciones } = require('../EscalasDiatonicas/moduleAngloSaxonNomenclature');
const { acordesJazz, intervaloTensiones, nombreCifrado_codigoTension_byNote, tensionesCondicionales } = require('./dataAcordesJazz');
const { lessOrEqualThan, destructuringNote, removeAltura } = require('./generadorAcordesServices');
const { acordeType } = require('../../enums/acordeType');
const { estadoAcorde } = require('../../enums/estadoAcorde');
const { referenciaReglaAcorde } = require('../../enums/referenciaReglaAcorde');
const { escalaCampoArmonico } = require('../../enums/escalaCampoArmonico');
const { log } = require('vexflow');

/**
 *
 * @param {Eb} note
 * @param {voices.tetrada_triada} voiceType
 * @param {[Eb2]} notesToAvoid
 * @returns Eb3 -> choose the number depending on the voiceType range.
 * if notesToAvoid.length > 0 -> return note with different altura that notes in notesToAvoid
 */
const getAltura = (note, voiceType, notesToAvoid, noteRange) => {
    let alturas = [1,2,3,4,5,6];

    // Remove alturas which are in notesToAvoid
    notesToAvoid.forEach(n => {
        const destructured = destructuringNote(n);
        if (note == (destructured.note + destructured.alteracion)) {
            alturas = removeAllItemsFromArr(alturas, destructured.altura);
        }
    });

    let noteResult = null;
    do {
        const h = getRandom(alturas);

        const noteToTry = note + h.toString();

        let higherNote = null;
        let lowerNote = null;
        if (noteRange) {
            higherNote = noteRange.higherNote;
            lowerNote = noteRange.lowerNote;
        } else {
            higherNote = getHigherNote(voiceType);
            lowerNote = getLowerNote(voiceType);
        };

        if (lessOrEqualThan(noteToTry, higherNote)) {
            if (lessOrEqualThan(lowerNote, noteToTry)) {
                // noteToTry is in the correct voiceType interval
                noteResult = noteToTry;
            } else {
                // noteToTry is lower than voiceType interval
                alturas = alturas.slice(alturas.indexOf(h) + 1);
            }
        } else {
            // noteToTry is higher than voiceType inverval
            alturas = alturas.slice(0, alturas.indexOf(h));
        }

    } while (noteResult == null && alturas.length > 0);

    return noteResult;
}

/**
 * 
 * @param {'Bbb'} nameNote 
 * @param {['C#2', 'Bbb3', 'Eb3', 'Bbb2', 'Cb2']} arrayNotes 
 * @returns ['Bbb3', 'Bbb2']
 */
const getSameNotesFromName = (nameNote, arrayNotes) => {
    return arrayNotes.filter(x => x.includes(nameNote));
}

/**
 *
 * @param {[ 'C', 'Eb', 'Gb', 'Bbb' ]} allNotes it could be notes from a Tétrada
 * @param {tetrada_triada} voiceType
 * @param {[Eb2, Gb3, Bbb2]} completeNotesToAvoid
 * @param {{higherNote: 'A2', lowerNote: 'C2'}} noteRange
 * @returns Gb3 -> must choosed depending on the restrictions (Overlap, invervals, NOT DISTANCES)
 * If not exists note which can select -> return null
 */
const getNote = (allNotes, voiceType, completeNotesToAvoid, noteRange) => {
    if (allNotes.length == 0) return null;

    let noteResult = null;

    // const previousNote = acorde[acorde.length - 1];
    let allNotesToIterate = JSON.parse(JSON.stringify(allNotes));
    do {
        // Get random note
        const randomNoteName = getRandom(allNotesToIterate);

        let notesToAvoid = getSameNotesFromName(
            randomNoteName,
            completeNotesToAvoid
        );
        let noteToTry = null;
        do {
            // Get different altura
            if (noteRange) {
                noteToTry = getAltura(randomNoteName, voiceType, notesToAvoid, noteRange);
            } else {
                noteToTry = getAltura(randomNoteName, voiceType, notesToAvoid, null);
            }

            if (noteToTry) {
                notesToAvoid.push(noteToTry);
                noteResult = noteToTry;
            }
        } while (noteResult == null && noteToTry != null);

        // Remove randomNoteName from allNotesToIterate
        allNotesToIterate = removeAllItemsFromArr(
            allNotesToIterate,
            randomNoteName
        );
    } while (allNotesToIterate.length > 0 && noteResult == null);

    return noteResult;
};

/**
 * 
 * @param {Maj7} encryptedName nombreCifrado from dataAcordesJazz
 * @param {C} keyNote  base note
 * @returns returns a tetrada, build besed on intervals from acordesJazz
 */
const generarTetradaJazz = (encryptedName, keyNote) => {
    const acorde = acordesJazz.find((e) => e.nombreCifrado == encryptedName);

    var result = [keyNote];
    var lastNote = keyNote;
    acorde.intervalos.forEach((i) => {
        lastNote = Note.transpose(keyNote, i);
        result.push(lastNote);
    });

    return result;
};


const getNotesProhibidasEnBajo = (encryptedName, keyNote) => {
    const acorde = acordesJazz.find((e) => e.nombreCifrado == encryptedName);

    var result = [];
    var lastNote = keyNote;
    if (acorde.prohibidasEnBajo.length > 0) {
        acorde.prohibidasEnBajo.forEach((i) => {
            lastNote = Note.transpose(keyNote, i);
            result.push(lastNote);
        });
    }

    return result;
}

/**
 * 
 * @param { 'A2', 'G#3', 'C#4', 'E4' ]} acorde 
 * @param {1} i 
 * @param {[A3]} notesToAvoid 
 * @param {[A G# C# E]} allNotes 
 * @returns { {acorde: acordeResult,newNotes: newNotes} } check distance between acorde[i] and acorde[i + 1] 
 *          -> if is not correct try to add notes until distances are ok. Add notes avoiding 2m intervals and checking intervals between any other pair.
 */
const fixDistances = (acorde, i, notesToAvoid, allNotes) => {
    // Avoid 2m intervals
    // Check intervals between any pair
    // if there are not way to fix acorde -> return {acorde: null, newNotes: []}
    // can be added more than one note

    if (!acorde[i + 1]) return acorde;

    let previousNote = acorde[i];
    let currentNote = acorde[i];
    let nextNote = acorde[i + 1];

    let acordeResult = acorde;
    let newNotes = [];

    let mustToAddNote = false;
    if (i == 0) {
        mustToAddNote =
            Interval.add(Interval.distance(nextNote, currentNote), '11P').charAt(0) == '-';
    } else {
        mustToAddNote =
            Interval.add(Interval.distance(nextNote, currentNote), '6M').charAt(0) == '-' ||
            Interval.add(Interval.distance(nextNote, currentNote), '6m').charAt(0) == '-';
    }

    while (mustToAddNote) {
        const higherNoteAux = Note.transpose(nextNote, '-1A');
        const lowerNoteAux = Note.transpose(currentNote, '1A');

        const noteRange = {
            higherNote: lessOrEqualThan(higherNoteAux, getHigherNote(voices.tetrada_triada)) 
                ? higherNoteAux
                : getHigherNote(voices.tetrada_triada),
            lowerNote: lessOrEqualThan(lowerNoteAux, getLowerNote(voices.tetrada_triada))
                ? getLowerNote(voices.tetrada_triada)
                : lowerNoteAux, 
        };
        
        let notesToAvoidToIteratre = notesToAvoid;
        let added = false;
        do {
            const note = getNote(allNotes, null, notesToAvoidToIteratre, noteRange);
    
            if (note == null) return { acorde: null, newNotes: [] };
            
            acordeResult.splice(acordeResult.indexOf(nextNote), 0, note);

            // Check if distance between current note and note != 2m
            // Check if distance between note and nextNote != 2m
            if (
                Interval.distance(currentNote, note) != '2m' &&
                Interval.distance(note, nextNote) != '2m' && 
                checkProhibitedIntervalsBetweenAnyPair(acordeResult)
            ) {
                newNotes.push(note);
                previousNote = currentNote;
                currentNote = note;
                added = true;
            } else {
                acordeResult = removeAllItemsFromArr(acordeResult, note);
                notesToAvoidToIteratre.push(note);
            }
            
        } while (!added);

        // Check if new distances are correct
        let mustToAdd1 =
            Interval.add(Interval.distance(nextNote, currentNote), '6M').charAt(0) == '-' ||
            Interval.add(Interval.distance(nextNote, currentNote), '6m').charAt(0) == '-';

        let mustToAdd2 = false;
        if (i == 0) {
            mustToAdd2 =
                Interval.add(Interval.distance(currentNote, previousNote), '11P').charAt(0) == '-';
        } else {
            mustToAdd2 =
                Interval.add(Interval.distance(currentNote, previousNote), '6M').charAt(0) == '-' ||
                Interval.add(Interval.distance(currentNote, previousNote), '6m').charAt(0) == '-';
        }

        if (mustToAdd1) {
            previousNote = currentNote;
        } 
        
        if (mustToAdd2) {
            nextNote = currentNote;
            currentNote = previousNote;
            previousNote = currentNote;
        }
        
        if (mustToAdd1 && mustToAdd2) {
            // ESTO NO DEBERÍA PASAR .....
            logError('fixDistances', 'A note was added (to try to fix distances problem) but two notes more have to be added to fix te problem (one before the note added and one after the note added).', null);
        }

        mustToAddNote = mustToAdd1 || mustToAdd2;
    }

    return {
        acorde: acordeResult,
        newNotes: newNotes,
    };
}

/**
 * 
 * @param {[ 'A2', 'G#3', 'C#4', 'E4' ]} acorde 
 * @param {1} i 
 * @param {[A G# C# E]} allNotes 
 * @returns { {acorde: acordeResult, action: 'added' | 'deleted' | 'nothing'}} check distance 2m between acorde[i] and acorde[i + 1] -> if is not correct try to add one note to 3M distance or delte one of them
 */
const fixConsecutivePair = (acorde, i, allNotes) => {
    // return {acorde: acorde, action: 'added' | 'deleted' | 'nothing' }
    // when add new note, check distances between any pair

    if (!acorde[i + 1]) return { acorde: acorde, action: 'nothing' };

    let currentNote = acorde[i];
    let nextNote = acorde[i + 1];
    let acordeResult = acorde;
    let action = 'nothing';

    if (Interval.distance(currentNote, nextNote) == '2m') {
        const shouldBeNextNote = Note.transpose(nextNote, '3M');
        let added = false;

        if (allNotes.indexOf(removeAltura(shouldBeNextNote)) > -1) {
            // Note can be added
            if (acordeResult[i + 2] && acordeResult[i + 2] != shouldBeNextNote) {
                acordeResult.splice(i + 2, 0, shouldBeNextNote);
                added = true;
            }

            if (!acordeResult[i + 2]) {
                acordeResult.push(shouldBeNextNote);
                added = true;
            }

            if (added) {
                // Check intervals between any pair
                if (!checkProhibitedIntervalsBetweenAnyPair(acordeResult)) {
                    // Delete inserted note and nextNote
                    acordeResult = removeAllItemsFromArr(acordeResult, shouldBeNextNote);
                    acordeResult = removeAllItemsFromArr(acordeResult, nextNote); // Note which has interval 2m
                    action = 'deleted';
                }
            }
        } else {
            // Delete inserted note and nextNote
            acordeResult = removeAllItemsFromArr(acordeResult, nextNote); // Note which has interval 2m
            action = 'deleted';
        }
    }

    return { acorde: acordeResult, action: action }; 

}

/**
 * 
 * @param {[ 'D3', 'F#3', 'G3', 'B3' ]} acorde 
 * @param {[ 'G', 'B', 'D', 'F#' ]} allNotes 
 * @returns return all notas which are in allNotes but not in acorde 
 */
const getMissingNotes = (acorde, allNotes) => {
    let result = [];
    if (acorde) {
        allNotes.forEach(note => {
            let isInAcorde = false;
            acorde.forEach(noteAcorde => {
                const n = removeAltura(noteAcorde);
                if (n == note) isInAcorde = true;
            });

            if (!isInAcorde) result.push(note);
        });
    }

    return result;
}

/**
 * 
 * @param {[ 'D3', 'F#3', 'G3', 'B3' ]} acorde 
 * @param {[ 'G', 'B', 'D', 'F#' ]} allNotes 
 * @returns check all notes be in acorde; distances between any pair and consecutive pairs -> return an avaliable acorde
 */
const completeAcorde = (acorde, allNotes, newIntervalLower, newIntervalHigher) => {
    if (acorde == null) return null;
    let ok = checkProhibitedIntervalsBetweenAnyPair(acorde);
    if (!ok) return null;

    let acordeResult = acorde;
    let i = 0;
    do {
        acordeResult = fixDistances(acordeResult, i, [], allNotes).acorde; 
        
        if (acordeResult == null) return null;

        const fixedConsecutivePairResult = fixConsecutivePair(acordeResult, i, allNotes); 

        acordeResult = fixedConsecutivePairResult.acorde;

        // if (fixedConsecutivePairResult.action == 'deleted') {
        //     console.log('JUST TO CHECK => one note was delted.....');
        //     acordeResult = fixDistances(acordeResult, i, [], allNotes).acorde;
            
        //     if (acordeResult == null) return null;
        // }

        i++;
    } while (acordeResult != null && i < acordeResult.length - 1);

    // Check all notes be in acordeResult
    const notesToAdd = getMissingNotes(acordeResult, allNotes);

    let noteRange = null;
    if (newIntervalLower && newIntervalHigher) {
        noteRange = getUpperRange(voices.tetrada_triada, newIntervalLower, newIntervalHigher)
    } else {
        noteRange = {
            higherNote: getHigherNote(voices.tetrada_triada),
            lowerNote: getLowerNote(voices.tetrada_triada), 
        };
    }
    notesToAdd.forEach((n) => {
        let notesToAvoid = [];
        let noteToTry = null;
        let noteResult = null;
        let added = false;
        do {
            // Get different altura
            noteToTry = getAltura(n, null, notesToAvoid, noteRange);

            if (noteToTry) {
                notesToAvoid.push(noteToTry);

                const acordeToTest = insertInOrder(acordeResult, noteToTry);
                if (checkProhibitedIntervalsBetweenConsecutivePair(acordeToTest) && checkProhibitedIntervalsBetweenAnyPair(acordeToTest)) {
                    acordeResult = acordeToTest;
                    added = true;
                } else {
                    if (!checkProhibitedIntervalsBetweenConsecutivePair(acordeToTest)) {
                        console.log('checkProhibitedIntervalsBetweenConsecutivePair' + ' noteToTry ' + noteToTry);
                    }

                    if (!checkProhibitedIntervalsBetweenAnyPair(acordeToTest)) {
                        console.log('checkProhibitedIntervalsBetweenAnyPair' + ' noteToTry ' + noteToTry);
                    }
                }
            }

        } while (noteToTry != null && !added);

        if (!added) {
            // logError('completeAcorde', 'No se pudo incluir todas las notas necesarias en el acorde');
            console.log(acordeResult);
            console.log(notesToAdd);
            console.log('--------------------------------------');

            if (!checkTetradaInAcorde(acordeResult, allNotes)) acordeResult = null;
        } 
    });

    // After check all notes be in acorde, could be still distances are wrong
    let j = 0;
    while (acordeResult && j < acordeResult.length - 1) {
        acordeResult = fixDistances(acordeResult, j, [], allNotes).acorde;
        if (acordeResult == null) return null;

        j++;
    }

    return acordeResult;
}



/**
 * 
 * @param {[A2, C#4, G4]} acorde 
 * @returns true
 */
const checkProhibitedIntervalsBetweenAnyPair = (acorde) => {
    /**
     * Entre cualquier par de voces: 9m ni sus octavas, ya sean notas consecutivas o no. 
     *  (solo puede existir contra el bajo)
     */

    if (acorde && acorde.length < 3) return true;

    // Check any pair
    let ok = true;
    if (acorde && acorde.length > 2) {
        // Not apply to interval BAJO
        for (let i = 1; i < acorde.length - 1; i++) {
            const note1 = acorde[i];
            
            for (let j = i + 1; j < acorde.length; j++) {
                const note2 = acorde[j];
                
                ok =
                    ok &&
                    Interval.distance(note1, note2) != '8P' &&
                    Interval.distance(note1, note2) != '9m';
            }
        }
    } 

    return ok;
}

/**
 * 
 * @param {[A2, C#4, G4]} acorde 
 * @returns true
 */
 const checkProhibitedIntervalsBetweenConsecutivePair = (acorde) => {
    /**
     * Entre voces consecutivas: 2m (*solo puede existir si: 
     *  existe otra nota consecutiva más aguda, que esté a una 4j y 3M de las notas que 
     *  conforman la 2m)
     */

    let result = true;
    if (acorde && acorde.length > 1) {
        for (let i = 0; i < acorde.length - 1 && result; i++) {            
            if (Interval.distance(acorde[i], acorde[i + 1]) == '2m') {
                if (acorde[i + 2]) {
                    if (
                        !(
                            Interval.distance(acorde[i + 1], acorde[i + 2]) == '3M'
                            && Interval.distance(acorde[i], acorde[i + 2]) == '4P'
                        )
                    ) {
                        result = false;
                    }
                } else {
                    result = false;
                }
            }
        }
    }

    return result;
}

/**
 * 
 * @param {[A2, C#4, G4]} acorde 
 * @returns Return false if exist distance bigger than 11P (with bajo) or 6m/6M (between any other note)
 *          Return true if not
 */
const checkProhibitedDistancesBetweenVoices = (acorde) => {
    let ok = true;
    if (acorde) {
        for (let i = 0; i < acorde.length - 1; i++) {
            if (i == 0) {
                ok = ok && Interval.add(Interval.distance(acorde[i+1], acorde[i]), '11P').charAt(0) != '-';
            } else {
                ok = ok && (
                    Interval.add(Interval.distance(acorde[i+1], acorde[i]), '6M').charAt(0) != '-' &&
                    Interval.add(Interval.distance(acorde[i+1], acorde[i]), '6m').charAt(0) != '-'
                );
            }
        }
    }

    return ok;
}


const checkNotExistEnarmoniasInAcorde = (acorde) => {
    let noEnarmonia = true;

    if (acorde) {
        acorde.forEach(a1 => {
            acorde.forEach(a2 => {
                if (Note.pitchClass(a1) != Note.pitchClass(a2)) {
                    noEnarmonia = noEnarmonia && !isEnarmonia(a1, a2);
                }
            });
        });
    }

    return noEnarmonia;
}


const checkTetradaInAcorde = (acorde, tetrada) => {
    return getMissingNotes(acorde, tetrada).length == 0
}

/**
 * 
 * @param {[] || [A2, C#4]} acorde 
 * @returns voices.bajo || voices.tetrada_triada
 */
const getVoiceTypeFromAcorde = (acorde) => {
    // TODO: depende si es tríada o tétrada para el caso de acorde.length = 3 :O
    switch (acorde.length) {
        case 0:
            return voices.bajo;
        case 1:
        case 2:
        case 3:
            return voices.tetrada_triada;
        default:
            return voices.tensiones;
    }
};

/**
 * 
 * @param {[string]} acorde ex [C2, D2, F2, C3]
 * @param {string} noteToInsert ex E2
 * @returns acorde with noteToInsert. Ex: [C2, D2, E2, F2, C3]
 */
const insertInOrder = (acorde, noteToInsert) => {
    let res = [];
    let inserted = false;

    acorde.forEach(note => {
        if (!inserted && lessOrEqualThan(noteToInsert, note)) {
            res.push(noteToInsert);
            inserted = true;
        }

        res.push(note);
    });

    if (!inserted) {
        res.push(noteToInsert);
    }

    return res;
}

const getFirstNoteBasedOnEstado = (estadosAcorde, tetrada, notesProhibidasEnBajo, notesNamesToAvoid) => {
    let estadosAcordeAux = estadosAcorde;
    let noteResult = null;

    do {
        const estado = getRandom(estadosAcordeAux);
        estadosAcordeAux = removeAllItemsFromArr(estadosAcordeAux, estado);

        switch (estado) {
            case estadoAcorde.fundamental:
                noteResult = tetrada[0];
                break;
            case estadoAcorde.primeraInversion:
                noteResult = tetrada[1];
                break;
            case estadoAcorde.segundaInversion:
                noteResult = tetrada[2];
                break;
            case estadoAcorde.terceraInversion:
                noteResult = tetrada[3];
                break;
            default:
                noteResult = null;
                break;
        }

        if (notesProhibidasEnBajo.indexOf(noteResult) != -1 || notesNamesToAvoid.indexOf(noteResult) != -1) noteResult = null;
    } while (estadosAcordeAux.length > 0 && noteResult == null);

    // noteResult can be null if there are no option to get first note based on estadosAcorde
    return noteResult;
}

/**
 * 
 * @param {*} voice 
 * @param {{lower: string, higher: string}} newIntervalLower {lower: 'F2', higher: 'D3'}
 * @param {{lower: string, higher: string}} newIntervalHigher {lower: 'G3', higher: 'D5'}
 * @returns upper notes
 */
const getUpperRange = (voice, newIntervalLower, newIntervalHigher) => {
    if (newIntervalHigher && newIntervalLower) {
        let lowerNoteResult = getLowerNote(voice)
        let higherNoteResult = null

        if (lessOrEqualThan(getHigherNote(voice), newIntervalHigher.higher)) {
            // nota mas alta del intervalo < nota mas alta del nuevo intervalo
            higherNoteResult = getHigherNote(voice)
        } else {
            higherNoteResult = newIntervalHigher.higher
        }

        return {
            higherNote: higherNoteResult,
            lowerNote: lowerNoteResult
        }
    } else {
        return null;
    }
}

/**
 * 
 * @param {voices} voice ex: voices.bajo
 * @param {{lower: string, higher: string}} newIntervalLower {lower: 'F2', higher: 'D3'}
 * @param {{lower: string, higher: string}} newIntervalHigher {lower: 'G3', higher: 'D5'}
 */
const getRange = (voice, newIntervalLower, newIntervalHigher) => {
    if (newIntervalHigher && newIntervalLower) {
        let lowerNoteResult = null
        let higherNoteResult = null
        if (voice == voices.bajo) {
            if (lessOrEqualThan(getLowerNote(voice), newIntervalLower.lower)) {
                // nota mas baja del bajo < nota mas baja del nuevo intervalo
                lowerNoteResult = newIntervalLower.lower
            } else {
                lowerNoteResult = getLowerNote(voice)
            }

            if (lessOrEqualThan(getHigherNote(voice), newIntervalLower.higher)) {
                // nota mas alta del bajo < nota mas alta del nuevo intervalo
                higherNoteResult = getHigherNote(voice)
            } else {
                higherNoteResult = newIntervalLower.higher
            }
        } else {
            if (lessOrEqualThan(getLowerNote(voice), newIntervalHigher.lower)) {
                // nota mas baja del intervalo < nota mas baja del nuevo intervalo
                lowerNoteResult = newIntervalHigher.lower
            } else {
                lowerNoteResult = getLowerNote(voice)
            }

            if (lessOrEqualThan(getHigherNote(voice), newIntervalHigher.higher)) {
                // nota mas alta del intervalo < nota mas alta del nuevo intervalo
                higherNoteResult = getHigherNote(voice)
            } else {
                higherNoteResult = newIntervalHigher.higher
            }
        }

        return {
            higherNote: higherNoteResult,
            lowerNote: lowerNoteResult
        }
    } else {
        return null;
    }
}

/**
 * 
 * @param {[E, G#]} allNotes notes from tetrada, all this notes has to be in acorde
 * @param {[A2, C#5]} acorde acorde until this moment. In each recurtion it will have a new note
 * @param {[E]} notesNamesToAvoid this notes can not be selected as next note in the acorde, but in the next recurtion has to be included
 * @param {[E]} notesProhibidasEnBajo
 * @param {[estadoAcorde.fundamental]} estadosAcorde
 * @returns recursive function. Returns an acorde with a minimum of 4 notes, with all notes of allNotes. 
 *          --- This functions don't check consecutive distances. ---
 */
const getIncompleteAcordeJazz = (allNotes, acorde, notesNamesToAvoid, notesProhibidasEnBajo, estadosAcorde, tetrada, newIntervalLower, newIntervalHigher) => {
    // Check if acorde is ok or fail
    const status = checkProhibitedIntervalsBetweenAnyPair(acorde);
    if (!status) return null;
    if (status && allNotes.length == 0) return acorde;
    let allNotesAux = allNotes;
    let note = null;

    if (getVoiceTypeFromAcorde(acorde) == voices.bajo) {
        const notaBajo = getFirstNoteBasedOnEstado(estadosAcorde, tetrada, notesProhibidasEnBajo, notesNamesToAvoid);
        // New note
        note = getNote(
            [notaBajo],
            getVoiceTypeFromAcorde(acorde),
            [],
            getRange(getVoiceTypeFromAcorde(acorde), newIntervalLower, newIntervalHigher),
        );
    } else {
        // New note
        // **************************
        // Verifico que no se pase de la nota máxima en base al acorde anterior
        // **************************
        const range = getUpperRange(getVoiceTypeFromAcorde(acorde), newIntervalLower, newIntervalHigher)
        note = getNote(
            subtractArrays(allNotesAux, notesNamesToAvoid),
            getVoiceTypeFromAcorde(acorde),
            [],
            range,
        );
    }

    if (note == null) return null;

    let acordeResult = insertInOrder(acorde, note);
    
    // Recursive with new note
    acordeResult = getIncompleteAcordeJazz(
        removeAllItemsFromArr(allNotes, removeAltura(note)),
        acordeResult,
        [],
        notesProhibidasEnBajo,
        estadosAcorde,
        tetrada,
        newIntervalLower, 
        newIntervalHigher
    );

    if (acordeResult) return acordeResult;

    // Recursive with the same acorde but new note will be avoided as next note in acorde
    return getIncompleteAcordeJazz(allNotes, acorde, [removeAltura(note)], notesProhibidasEnBajo, estadosAcorde, tetrada, newIntervalLower, newIntervalHigher);
};


const isEnarmonia = (note1, note2) => {
    return Note.chroma(note1) == Note.chroma(note2);
}

/**
 * 
 * @param {nombre: 'Novena Mayor', codigo: '9', tipo: '9', intervalo: '9M', semitonos: 2, cantidadNombres: 2} tension 
 * @param {[F#2, F#3, C#4, G#4, B4]} acorde 
 * @param {B} keyNote 
 * @returns true if exist enarmonía when the tension is applied to acorde
 *              if not false
 */
const checkExistEnarmonias = (tension, acorde, keyNote) => {
    const noteResult = Note.transpose(keyNote, tension.intervalo);

    let existEnarmonia = false;
    // Start i = 0 because we have to check Enarmonías in the first note too (interval BAJO)
    for (let i = 0; i < acorde.length; i++) {
        const n = acorde[i];
        
        existEnarmonia = existEnarmonia || isEnarmonia(n, noteResult);
    }

    return existEnarmonia;
}


const checkTensionAlreadyApplaied = (tension, tensionesApplied) => {
    const tApplied = tensionesApplied.find(t => t.tipo == tension.tipo);

    if (!tApplied) {
        return false;
    } else {
        if (
            (tApplied.codigo == 'b9' && tension.codigo == '#9') ||
            (tension.codigo == 'b9' && tApplied.codigo == '#9')
        ) {
            return false;
        } else {
            return true;
        }
    }
}

/**
 * 
 * @param {nombre: 'Novena Mayor', codigo: '9', tipo: '9', intervalo: '9M', semitonos: 2, cantidadNombres: 2} tension 
 * @param {[ tension1, tension2 ]} tensionesApplied 
 * @param {[F#2, F#3, C#4, G#4, B4]} acorde 
 * @param {B} keyNote 
 * @returns true if Tension will be applied
 *          false if:   1. Tension type already exists, 
 *                      2. Enarmonía exist in interval tétrada/triada  
 *                      3. (NOT MORE) -> 0.5 of probability to be applied or not
 */
const isTensionApplied = (tension, tensionesApplied, acorde, keyNote) => {
    // Check if tension with same name already applaied
    if (checkTensionAlreadyApplaied(tension, tensionesApplied)) return false;

    // Check if there are any Enarmonía
    if (checkExistEnarmonias(tension, acorde, keyNote)) return false;

    // Filter randomly if Tension is applied or not
    // const rdm = Math.floor(Math.random() * 10000 + 1); // nro random de 4 cifras
    // if (rdm % 2 == 0) return false
    
    return true;
}

const insertTensionInAcorde = (acorde, noteToTry) => {
    let acordeResult = insertInOrder(acorde, noteToTry);

    if (!checkProhibitedIntervalsBetweenAnyPair(acordeResult)) {
        // Fix noteToTry between any pair

        let acordeAux = [];
        acordeResult.forEach(note => {
            let incorrectInterval = Interval.distance(note, noteToTry) == '8P' || Interval.distance(note, noteToTry) == '-8P' ||
                Interval.distance(note, noteToTry) == '9m' || Interval.distance(note, noteToTry) == '-9m';
            
            if (incorrectInterval) {
                // If note is duplicated -> delete it 
                if (acordeResult.filter(n => Note.get(n).letter == Note.get(note).letter).length < 2) {
                    // Note is not duplicated 
                    acordeAux.push(note);
                }
            } else {
                acordeAux.push(note);
            }
        });

        acordeResult = acordeAux;
    }
    if (!checkProhibitedIntervalsBetweenConsecutivePair(acordeResult)) {
        // Fix noteToTry between consecutive pair
        const index = acordeResult.findIndex((x) => x == noteToTry);

        if (acordeResult[index + 1]) {
            if (Interval.distance(acordeResult[index], acordeResult[index + 1]) == '2m') {
                if (acordeResult[index + 2]) {
                    if (
                        !(
                            Interval.distance(acordeResult[index + 1], acordeResult[index + 2]) == '3M'
                            && Interval.distance(acordeResult[index], acordeResult[index + 2]) == '4P'
                        )
                    ) {
                        // if note acordeResult[index + 1] duplicated -> delete it
                        if (acordeResult.filter(n => Note.get(n).letter == Note.get(acordeResult[index + 1]).letter).length > 1) {
                            // duplicated note
                            acordeResult = removeAllItemsFromArr(acordeResult, acordeResult[index + 1]);
                        }
                    }
                } else {
                    // if note acordeResult[index + 1] duplicated -> delete it
                    if (acordeResult.filter(n => Note.get(n).letter == Note.get(acordeResult[index + 1]).letter).length > 1) {
                        // duplicated note
                        acordeResult = removeAllItemsFromArr(acordeResult, acordeResult[index + 1]);
                    }
                }
            }
        }

        if (acordeResult[index - 1]) {
            if (Interval.distance(acordeResult[index - 1], acordeResult[index]) == '2m') {
                if (acordeResult[index + 1]) {
                    if (
                        !(
                            Interval.distance(acordeResult[index], acordeResult[index + 1]) == '3M'
                            && Interval.distance(acordeResult[index - 1], acordeResult[index + 1]) == '4P'
                        )
                    ) {
                        // if note acordeResult[index - 1] duplicated -> delete it
                        if (acordeResult.filter(n => Note.get(n).letter == Note.get(acordeResult[index - 1]).letter).length > 1) {
                            // duplicated note
                            acordeResult = removeAllItemsFromArr(acordeResult, acordeResult[index - 1]);
                        }
                    }
                } else {
                    // if note acordeResult[index - 1] duplicated -> delete it
                    if (acordeResult.filter(n => Note.get(n).letter == Note.get(acordeResult[index - 1]).letter).length > 1) {
                        // duplicated note
                        acordeResult = removeAllItemsFromArr(acordeResult, acordeResult[index - 1]);
                    }
                }
            }
        }
    }

    return acordeResult;
}

/**
 * 
 * @param {[F#2, F#3, C#4, G#4, B4]} acorde 
 * @param {{nombre: 'Novena menor',codigo: 'b9',tipo: '9',intervalo: '9m',semitonos: 1,cantidadNombres: 2,}} tension 
 * @param {C} keyNote 
 * @param {{lower: string, higher: string}} newIntervalLower {lower: 'F2', higher: 'D3'}
 * @param {{lower: string, higher: string}} newIntervalHigher {lower: 'G3', higher: 'D5'}
 * @returns returns the acorde after apply tension. 
 *          If is not possible to apply, return same acorde and accordeApplied = false 
 *          {acorde, acordeApplied}
 */
const applyTensionToAcorde = (acorde, tension, keyNote, newIntervalLower, newIntervalHigher, tetrada) => {
    const newNote = Note.transpose(keyNote, tension.intervalo);

    let acordeResult = acorde;
    let notesToAvoid = [];
    let noteToTry = null;
    let acordeApplied = false;

    const noteRange = getUpperRange(voices.tensiones, newIntervalLower, newIntervalHigher)
    let acordeToCheck = null;
        
    do {
        // Get different altura
        noteToTry = getAltura(newNote, voices.tensiones, notesToAvoid, noteRange);

        if (noteToTry) {
            notesToAvoid.push(noteToTry);
            acordeToCheck = insertTensionInAcorde(acorde, noteToTry);
            acordeToCheck = completeAcorde(acordeToCheck, tetrada, newIntervalLower, newIntervalHigher);
            
            acordeApplied = checkProhibitedIntervalsBetweenAnyPair(acordeToCheck) 
                            && checkProhibitedIntervalsBetweenConsecutivePair(acordeToCheck) 
                            && checkProhibitedDistancesBetweenVoices(acordeToCheck);
            if (acordeToCheck) acordeResult = acordeToCheck;
        }
    } while (noteToTry != null && acordeToCheck == null /*&& !acordeApplied*/);

    // if (!acordeApplied) {
    //     console.log('NOT ACORDE APLIED');
    //     console.log(acorde);
    //     console.log(newNote);
    // }

    return acordeResult;
    // return {
    //     acorde: acordeResult,
    //     acordeApplied: acordeApplied,
    // }
}

/**
 * 
 * @param {[{nombre: 'Novena menor',codigo: 'b9',tipo: '9',intervalo: '9m',semitonos: 1,cantidadNombres: 2,}]} intervaloTensionesAux 
 * @param {{nombre: 'Novena menor',codigo: 'b9',tipo: '9',intervalo: '9m',semitonos: 1,cantidadNombres: 2,}} tension 
 * @returns returns intervaloTensionesAux list without tension
 */
const deleteTension = (intervaloTensionesAux, tension) => {
    let res = [];

    intervaloTensionesAux.forEach(t => {
        if (t.codigo != tension.codigo) {
            res.push(t);
        }
    });

    return res;
}

/**
 * 
 * @param {[F#2, F#3, C#4, G#4, B4]} acorde 
 * @param {*} keyNote 
 * @param {*} addingTensiones
 * @param {{lower: string, higher: string}} newIntervalLower {lower: 'F2', higher: 'D3'}
 * @param {{lower: string, higher: string}} newIntervalHigher {lower: 'G3', higher: 'D5'}
 * @return an array of notes (ex C#5, Eb5) which belongs to tensiones section. 
 * That notes can't be the same notes of the tetrada.
 */
const addTensiones = (acorde, keyNote, addingTensiones, tensionesAlreadyApplied, newIntervalLower, newIntervalHigher, tetrada) => {
    let intervaloTensionesAux = addingTensiones;
    let acordeAux = acorde;
    let tensionesApplied = tensionesAlreadyApplied;

    if (acorde) {
        do {
            // TODO: insted of get random tensiones, get posibles tensiones, order it and then apply in a loop
            // in this way we could avoid distances bigguer than 6m/6M or 11P
            // However distances are checked when a tension is applied
            const tension = getRandom(intervaloTensionesAux);

            if (isTensionApplied(tension, tensionesApplied, acorde, keyNote)) {  
                acordeAux = applyTensionToAcorde(acordeAux, tension, keyNote, newIntervalLower, newIntervalHigher, tetrada);
                tensionesApplied.push(tension);
            }
            
            intervaloTensionesAux = deleteTension(intervaloTensionesAux, tension);
        } while (intervaloTensionesAux.length > 0 && acordeAux != null);
    }

    return {
        acorde: acordeAux,
        tensionesApplied: tensionesApplied,
    };
}

/**
 * 
 * @param {[{nombre: 'Novena menor',codigo: 'b9',tipo: '9',intervalo: '9m',semitonos: 1,cantidadNombres: 2,}]} tensionesApplied 
 * @returns 'b9 11'
 */
const printTensiones = (tensionesApplied, tipo) => {
    let tensionesAppliedOrdered = tensionesApplied
    tensionesAppliedOrdered.sort(function(a, b){return a.semitonos - b.semitonos});

    let res = '';
    if (tipo == acordeType.triada && tensionesAppliedOrdered.length > 0) {
        res = 'add ';
    }

    tensionesAppliedOrdered.forEach(t => {
        res = res + t.codigo + ' ';
    });

    return res;
}

const getReferenceNoteInRange = (note) => {
    // Note between E3 - D#4
    let result = note;
    let lowerInterval = Interval.distance('E3', result);
    let higherInterval = Interval.distance(result, 'D#4');

    while (lowerInterval.charAt(0) == '-') {
        result = Note.transpose(result, '8P');
        lowerInterval = Interval.distance('E3', result);
    }

    while (higherInterval.charAt(0) == '-') {
        result = Note.transpose(result, '-8P');
        higherInterval = Interval.distance(result, 'D#4');
    }

    return result;
}

const addTensionCondicional = (escala, keyNote, encryptedName, tetrada, addingTensiones, originalKeyNote) => {
    // Check if intervalo condicional exist
    const tensionesCondicionalesPosibles = tensionesCondicionales.filter(
        (x) =>
            x.escala == escala &&
            x.keyNote == originalKeyNote &&
            x.nombreCifrado == encryptedName
    );
    if (tensionesCondicionalesPosibles.length == 0) return { tetrada: tetrada, tension: null }

    let tensionesToApply = []
    tensionesCondicionalesPosibles.forEach(t => {
        const tensionFinded = addingTensiones.find((x) => x.codigo == t.tension)
        if (tensionFinded) {
            tensionesToApply.push(t)
        }
    });

    if (tensionesToApply.length == 0) return { tetrada: tetrada, tension: null }

    // if exists -> add one with 100% (NO 50%) of chances and delete intervalo prohibido
    
    const tensionCondicional = getRandom(tensionesToApply)

    // delete intervalo prohibido
    const noteToDelete = Note.transpose(keyNote, tensionCondicional.intervaloProhibido);
    let newTetrada = removeAllItemsFromArr(tetrada, noteToDelete);

    // add new note from tension
    const noteToAdd = Note.transpose(keyNote, tensionCondicional.intervalo);
    newTetrada.push(noteToAdd)

    return { tetrada: newTetrada, tension: tensionCondicional.tension };
}

/**
 * 
 * @param {string} note 
 * @param {{lower: string, higher: string}} interval {lower: 'F2', higher: 'D3'}
 * @returns true if interval.lower <= note <= interval.higher
 */
const isNoteInInterval = (note, interval) => {
    return lessOrEqualThan(interval.lower, note) && lessOrEqualThan(note, interval.higher);
}

/**
 * Duplicate note in range
 * @param {[E, G#, B, Cb]} allNotes notes from tetrada, all this notes has to be in acorde
 * @param {[E2, G#5, B5, Cb5]} acorde acorde until this moment
 * @param {[E3, E4, B2]} notesToAvoid notes can't be added
 * @param {{lower: string, higher: string}} newIntervalLower {lower: 'F2', higher: 'D3'}
 * @param {{lower: string, higher: string}} newIntervalHigher {lower: 'G3', higher: 'D5'}
 * @returns acorde with note in new interval (newIntervalLower - newIntervalHigher)
 *          if can't insert -> return null
 */
const duplicateNotes = (allNotes, acorde, notesToAvoid, newIntervalLower, newIntervalHigher) => {
    if (isNoteInInterval(acorde[acorde.length - 1], newIntervalHigher)) return { acorde: acorde, newNote: null };

    const note = getNote(
        allNotes,
        null,
        notesToAvoid,
        getRange(voices.tetrada_triada, newIntervalLower, newIntervalHigher),
    );
    if (note == null) return { acorde: null, newNote: null }

    return {
        acorde: insertInOrder(acorde, note),
        newNote: note,
    }
}

// addingTensiones -> son las tensiones que si o si tienen que ir
const generarAcordeJazz = (encryptedName, keyNote, addingTensiones, tipo, estadosAcorde, referenceRule, escala, newIntervalLower, newIntervalHigher, originalKeyNote) => {
    const MAX_ITERATION = 15;
    let acorde = null;
    let tensionesApplied = [];
    let tetrada;

    // Get tetrada
    tetrada = generarTetradaJazz(encryptedName, keyNote);
    const notesProhibidasEnBajo = getNotesProhibidasEnBajo(encryptedName, keyNote);

    // add tension condicional 
    const tensionesCondicionalesAdded = addTensionCondicional(escala, keyNote, encryptedName, tetrada, addingTensiones, originalKeyNote) // Si existe tensión especial  la agrega y saca el intervalo que no debe estar

    tetrada = tensionesCondicionalesAdded.tetrada;
    const tensionAppliedAsCondicional = intervaloTensiones.find((x) => x.codigo == tensionesCondicionalesAdded.tension)
    if (tensionAppliedAsCondicional) tensionesApplied.push(tensionAppliedAsCondicional)
    
    let j = 0;
    do {
        // Get acorde
        acorde = getIncompleteAcordeJazz(tetrada, [], [], notesProhibidasEnBajo, estadosAcorde, tetrada, newIntervalLower, newIntervalHigher);
        acorde = completeAcorde(acorde, tetrada, newIntervalLower, newIntervalHigher);
        if (addingTensiones.length > 0) {
            const resultTensiones = addTensiones(acorde, keyNote, addingTensiones, tensionesApplied, newIntervalLower, newIntervalHigher, tetrada);
            acorde = resultTensiones.acorde;
            tensionesApplied = resultTensiones.tensionesApplied;
        }
        if (acorde && newIntervalLower && newIntervalHigher) {
            // Check intervals between higher notes
            let notesToAvoid = [];
            let ok = false;
            let exit = false;
            let acordeToInterate = acorde


            do {
                const result = duplicateNotes(tetrada, acorde, notesToAvoid, newIntervalLower, newIntervalHigher)
                // TODO: if result.acorde == null and recorde.newNote == null 
                // Quiere decir que no pudo insertar ninguna nota en el intervalo. ¿¿¿¿¿¿Eso está bien??????
                acordeToInterate = result.acorde
                if (acordeToInterate) {
                    acordeToInterate = completeAcorde(acordeToInterate, tetrada, newIntervalLower, newIntervalHigher);
                    if (result.newNote) notesToAvoid.push(result.newNote)
                    ok = acordeToInterate != null
                } else {
                    // can't find note to insert
                    exit = true
                }
            } while (!ok && !exit)
            if (ok) acorde = acordeToInterate
        }

        j++;
    } while (acorde == null && j < MAX_ITERATION);

    let name = '';

    if (acorde) {
        if (keyNote == removeAltura(acorde[0])) {
            name = keyNote + ' ' + encryptedName + ' ' + printTensiones(tensionesApplied, tipo); 
        } else {
            name = keyNote + ' ' + encryptedName + ' ' + printTensiones(tensionesApplied, tipo) + '/ ' + removeAltura(acorde[0]); 
        }
    }

    // JUST TO CHECK 
    if (!checkProhibitedIntervalsBetweenConsecutivePair(acorde)) console.log('///////////////////////////////////////////////// WRONG.. checkProhibitedIntervalsBetweenConsecutivePair')
    if (!checkProhibitedIntervalsBetweenAnyPair(acorde)) console.log('///////////////////////////////////////////////// WRONG... checkProhibitedIntervalsBetweenAnyPair')
    if (!checkProhibitedDistancesBetweenVoices(acorde)) console.log('///////////////////////////////////////////////// WRONG... fixDistances -> there is a distance bigger than 11P or 6m/6M');
    if (!checkNotExistEnarmoniasInAcorde(acorde)) console.log('///////////////////////////////////////////////// WRONG... existEnarmonia');
    if (!checkTetradaInAcorde(acorde, tetrada)) {
        console.log('///////////////////////////////////////////////// WRONG... missing notes in acorde');
        console.log(tetrada);
        console.log(acorde);
    }

    let referenceNoteResult = null;
    if (referenceRule == null) {
        referenceNoteResult = getReferenceNoteInRange(keyNote + '4') // just add altura
    } else {
        if (referenceRule == referenciaReglaAcorde.fundamental) {
            referenceNoteResult = getReferenceNoteInRange(keyNote + '4') // just add altura
        } else if (referenceRule == referenciaReglaAcorde.bajo) {
            referenceNoteResult = getReferenceNoteInRange(removeAltura(acorde[0]) + '4') // just add altura
        }
    }

    return {
        name,
        acorde,
        referenceNote: referenceNoteResult, // getReferenceNoteInRange(keyNote + '4'), // just add altura
    };
}

/**
 * 
 * @param {string} note note with no altura. Ex C
 * @param {acordeType} acordeType enum acordeType (tetrada or triada)
 * @returns acorde
 */
const generarAcordeJazzFromNote = (note, acordeType) => {
    // TODO: nombreCifrado_codigoTension_byNote -> get from parameter, Configuración_CampoArmonico (mismo formato)
    // Get tetrada and posible tensiones for note
    const nombreCifrado_codigoTension_Posibles = nombreCifrado_codigoTension_byNote.find(x => x.keyNote == note && x.acordeType == acordeType);
    const nombreCifrado_codigoTension = getRandom(nombreCifrado_codigoTension_Posibles.nombreCifrado_codigoTension);
    
    // Get EscalaDiatónica randomly and transpose note to EscalaDiatónica
    // TODO: get tonality from tonality available (Configuracion_CampoArmonico)
    const tonality = getRandom(ALTERACIONES_ESCALA_DIATONICA);
    const newNote = transformarAEscalaDiatonica([note], tonality.escala); // with alteraciones applied

    const possibleTensiones = intervaloTensiones.filter(i => nombreCifrado_codigoTension.codigosTensiones.indexOf(i.codigo) > -1);

    // nombreCifrado_codigoTension.codigosTensiones

    const result = generarAcordeJazz(nombreCifrado_codigoTension.nombreCifrado, newNote[0], possibleTensiones, 0);

    // TODO: define if apply or not alteraciones
    // const acorde = applyAlteraciones(result.acorde, tonality.escala);

    return {
        name: result.name,
        acorde: result.acorde,
        tonality: tonality.escala,
        referenceNote: result.referenceNote,
    };
}

const getDifferentsEscalas = (dataCamposArmonicos) => {
    let res = [];

    dataCamposArmonicos.forEach(ca => {
        if (res.find(x => x.Escala == ca.Escala) == null) {
            res.push({
                elem: ca.Escala,
                prioridad: ca.EscalaPrioridad,
            });
        }
    });

    return res;
}

const getDifferentsKeyNotes = (dataCamposArmonicos) => {
    let res = [];

    dataCamposArmonicos.forEach(ca => {
        if (res.find(x => x.KeyNote == ca.KeyNote) == null) {
            res.push({
                elem: ca.KeyNote,
                prioridad: ca.KeyNotePrioridad,
            });
        }
    });

    return res;
}

const getDifferentsTensiones = (tensiones) => {
    if (tensiones == '') {
        return [];
    }

    let tensionesStr = tensiones.replace('add','');
    tensionesStr = tensionesStr.replace(' ', '');

    const tensionesArr = tensionesStr.split(',');

    return intervaloTensiones.filter(i => tensionesArr.indexOf(i.codigo) > -1);
}

const getEstadosAcorde = (estadosAcordeStr) => {
    const estadosAcordeWithoutBlancSpaces = estadosAcordeStr.replace(' ', '');
    return estadosAcordeWithoutBlancSpaces.split(',').map((x) => parseInt(x));
}

/**
 * 
 * @param {[Object]} dataCamposArmonicos {
    Escala: escalaCampoArmonico.mayor,
    EscalaPrioridad: 1,
    KeyNote: 'C',
    KeyNotePrioridad: 1,
    NombreCifrado: nombreCifrado_TetradaTriada.tetrada_Maj7,
    SpecificTensions: 
        intervaloTensiones.novenaMayor +
        ', ' +
        intervaloTensiones.tercenaMayor,
    Tension:
        intervaloTensiones.novenaMayor +
        ', ' +
        intervaloTensiones.tercenaMayor,
    Tipo: acordeType.tetrada,
    EstadosAcorde: 'estadoAcorde.fundamental, estadoAcorde.terceraInversion'
}
 * @param {[{elem: string, prioridad: int}]} tonality [{elem: 'Do', prioridad: 3}] ¡¡¡ATENCIÓN!!! elem es Do y NO es C
 * @param {referenciaReglaAcorde} referenceRule referenciaReglaAcorde.fundamental || referenciaReglaAcorde.bajo
 * @param {{lower: string, higher: string}} newIntervalLower {lower: 'F2', higher: 'D3'}
 * @param {{lower: string, higher: string}} newIntervalHigher {lower: 'G3', higher: 'D5'}
 * @returns acorde = { name: result.name, acorde: result.acorde, tonality: tonality.escala }
 */
const getAcordeJazz = (dataCamposArmonicos, tonality, referenceRule, newIntervalLower, newIntervalHigher) => {
    // get tonality
    const tonalitySelected = getElemPrioridad(tonality);

    // get escala based on priority
    const escala = getElemPrioridad(getDifferentsEscalas(dataCamposArmonicos));

    // get key note based on priority
    const keyNote = getElemPrioridad(getDifferentsKeyNotes(dataCamposArmonicos.filter((x) => x.Escala == escala)));

    const nombresCifrados_tensiones = dataCamposArmonicos.filter((x) => 
        x.Escala == escala && x.KeyNote == keyNote
    );
    const nombreCifrado_tension = getRandom(nombresCifrados_tensiones);
    
    // get nombreCifrado
    const nombreCifrado = nombreCifrado_tension.NombreCifrado;

    // get tensiones ...
    // TODO: getParticularTensiones
    // en tensiones voy a tener las tensiones que si o si tienen que ir
    // Se va a agregar otro campo en lugar de Tension (nombreCifrado_tension.Tension) para tener las tensiones que si o si tienen que aplicar
    // const tensiones = getDifferentsTensiones(nombreCifrado_tension.Tension);
    const tension = dataCamposArmonicos.find(x => x.Escala == escala && x.KeyNote == keyNote && x.NombreCifrado == nombreCifrado)?.Tension
    // Validator
    if (typeof tension != 'string') {
        console.log('tension NO ES STRING !!!!');
        console.log(tension);
        console.log(typeof tension);
    }
    const tensiones = getDifferentsTensiones(tension);
    const alt = ALTERACIONES_ESCALA_DIATONICA.find(x => x.escalaTraducida == tonalitySelected || x.escala == tonalitySelected);

    // transpose keyNote to tonalitySelected
    const newNote = transformarAEscalaDiatonica([keyNote], alt.escala); // with alteraciones applied

    // get estado de acorde
    const estadosAcordeArray = getEstadosAcorde(
        dataCamposArmonicos.find((x) => x.Escala == escala && x.KeyNote == keyNote).EstadosAcorde
    );

    const result = generarAcordeJazz(nombreCifrado, newNote[0], tensiones, nombreCifrado_tension.Tipo, estadosAcordeArray, referenceRule, escala, newIntervalLower, newIntervalHigher, keyNote);

    // TODO: define if apply or not alteraciones
    // const acorde = applyAlteraciones(result.acorde, tonality.escala);

    return {
        name: result.name,
        acorde: result.acorde,
        tonality: alt.escala,
        type: nombreCifrado_tension.Tipo,
        referenceNote: result.referenceNote,
    };
}

module.exports = {
    generarTetradaJazz,
    generarAcordeJazz,
    fixDistances,
    getAcordeJazz,
};

// ------------------------------------------------------------
// THIS ACORDE CAN NOT BE COMPLETED
// ------------------------------------------------------------
// console.log(completeAcorde([ 'F2', 'E4', 'A4', 'C5' ], [ 'F', 'A', 'C', 'E' ]));
// ------------------------------------------------------------



const printToSee = (elem) => {
    let res = '';
    if (elem.tonality) {
        res = elem.name + ' (ESCALA: ' + elem.tonality + ')' + ' -->> ';
    } else {
        res = elem.name + ' -->> ';
    }
    elem.acorde.forEach(n => {
        res = res + n + ' ';
    });

    return res;
}

