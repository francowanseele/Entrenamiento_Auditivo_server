const { Note, Interval } = require('@tonaljs/tonal');
const { getHigherNote, getLowerNote, voices } = require('../../enums/voicesJazz');
const { getRandom, removeAllItemsFromArr, subtractArrays, getElemPrioridad } = require('../Dictados_FuncGral/funcionesGenerales');
const { logError } = require('../errorService');
const { ALTERACIONES_ESCALA_DIATONICA } = require('../EscalasDiatonicas/datosAngloSaxonNomenclature');
const { transformarAEscalaDiatonica, applyAlteraciones } = require('../EscalasDiatonicas/moduleAngloSaxonNomenclature');
const { acordesJazz, intervaloTensiones, nombreCifrado_codigoTension_byNote } = require('./dataAcordesJazz');
const { lessOrEqualThan, destructuringNote, removeAltura } = require('./generadorAcordesServices');
const { acordeType } = require('../../enums/acordeType');

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

    // Check distances between voices (6m/6M or 11P)
    // if(!checkProhibitedDistancesBetweenVoices(acordeResult)) {
    //     console.log('..');
    //     console.log(acordeResult);
    //     console.log('..');
    // }

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
    allNotes.forEach(note => {
        let isInAcorde = false;
        acorde.forEach(noteAcorde => {
            const n = removeAltura(noteAcorde);
            if (n == note) isInAcorde = true;
        });

        if (!isInAcorde) result.push(note);
    });

    return result;
}

/**
 * 
 * @param {[ 'D3', 'F#3', 'G3', 'B3' ]} acorde 
 * @param {[ 'G', 'B', 'D', 'F#' ]} allNotes 
 * @returns check all notes be in acorde; distances between any pair and consecutive pairs -> return an avaliable acorde
 */
const completeAcorde = (acorde, allNotes) => {
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

    const noteRange = {
        higherNote: getHigherNote(voices.tetrada_triada),
        lowerNote: getLowerNote(voices.tetrada_triada),
    };
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

    if (acorde.length < 3) return true;

    // Check any pair
    let ok = true;
    if (acorde.length > 2) {
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
    if (acorde.length > 1) {
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

    return ok;
}


const checkNotExistEnarmoniasInAcorde = (acorde) => {
    let noEnarmonia = true;

    acorde.forEach(a1 => {
        acorde.forEach(a2 => {
            if (Note.pitchClass(a1) != Note.pitchClass(a2)) {
                noEnarmonia = noEnarmonia && !isEnarmonia(a1, a2);
            }
        });
    });

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
 * @param {[C2, D2, F2, C3]} acorde 
 * @param {E2} noteToInsert 
 * @returns [C2, D2, E2, F2, C3]
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

/**
 * 
 * @param {[E, G#]} allNotes notes from tetrada, all this notes has to be in acorde
 * @param {[A2, C#5]} acorde acorde until this moment. In each recurtion it will have a new note
 * @param {[E]} notesNamesToAvoid this notes can not be selected as next note in the acorde, but in the next recurtion has to be included
 * @param {[E]} notesProhibidasEnBajo
 * @returns recursive function. Returns an acorde with a minimum of 4 notes, with all notes of allNotes. 
 *          --- This functions don't check consecutive distances. ---
 */
const getIncompleteAcordeJazz = (allNotes, acorde, notesNamesToAvoid, notesProhibidasEnBajo) => {
    // TODO: For triadas, change number of 4 by 3

    // Check if acorde is ok or fail
    const status = checkProhibitedIntervalsBetweenAnyPair(acorde);
    if (!status) return null;
    if (status && allNotes.length == 0) return acorde;
    let allNotesAux = allNotes;

    if (getVoiceTypeFromAcorde(acorde) == voices.bajo) {
        allNotesAux = subtractArrays(allNotes, notesProhibidasEnBajo);
    }

    // New note
    let note = getNote(
        subtractArrays(allNotesAux, notesNamesToAvoid),
        getVoiceTypeFromAcorde(acorde),
        [],
        null
    );
    if (note == null) return null;

    let acordeResult = insertInOrder(acorde, note);
    
    // Recursive with new note
    acordeResult = getIncompleteAcordeJazz(
        removeAllItemsFromArr(allNotes, removeAltura(note)),
        acordeResult,
        [],
        notesProhibidasEnBajo
    );

    if (acordeResult) return acordeResult;

    // Recursive with the same acorde but new note will be avoided as next note in acorde
    return getIncompleteAcordeJazz(allNotes, acorde, [removeAltura(note)], notesProhibidasEnBajo);
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
 *                      3. 0.5 of probability to be applied or not
 */
const isTensionApplied = (tension, tensionesApplied, acorde, keyNote) => {
    // Check if tension with same name already applaied
    if (checkTensionAlreadyApplaied(tension, tensionesApplied)) return false;

    // Check if there are any Enarmonía
    if (checkExistEnarmonias(tension, acorde, keyNote)) return false;

    // Filter randomly if Tension is applied or not
    const rdm = Math.floor(Math.random() * 10000 + 1); // nro random de 4 cifras
    if (rdm % 2 == 0) return false
    
    return true;
}

/**
 * 
 * @param {[F#2, F#3, C#4, G#4, B4]} acorde 
 * @param {{nombre: 'Novena menor',codigo: 'b9',tipo: '9',intervalo: '9m',semitonos: 1,cantidadNombres: 2,}} tension 
 * @param {C} keyNote 
 * @returns returns the acorde after apply tension. 
 *          If is not possible to apply, return same acorde and accordeApplied = false 
 *          {acorde, acordeApplied}
 */
const applyTensionToAcorde = (acorde, tension, keyNote) => {
    const newNote = Note.transpose(keyNote, tension.intervalo);

    let acordeResult = acorde;
    let notesToAvoid = [];
    let noteToTry = null;
    let acordeApplied = false;
        
    do {
        // Get different altura
        noteToTry = getAltura(newNote, voices.tensiones, notesToAvoid, null);

        if (noteToTry) {
            notesToAvoid.push(noteToTry);
            const acordeToCheck = insertInOrder(acorde, noteToTry);
            acordeApplied = checkProhibitedIntervalsBetweenAnyPair(acordeToCheck) 
                            && checkProhibitedIntervalsBetweenConsecutivePair(acordeToCheck) 
                            && checkProhibitedDistancesBetweenVoices(acordeToCheck);
            if (acordeApplied) acordeResult = acordeToCheck;
        }
    } while (noteToTry != null && !acordeApplied);

    return {
        acorde: acordeResult,
        acordeApplied: acordeApplied,
    }
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
 * @param {*} possibleTensiones
 * @return an array of notes (ex C#5, Eb5) which belongs to tensiones section. 
 * That notes can't be the same notes of the tetrada.
 */
const addTensiones = (acorde, keyNote, possibleTensiones) => {
    let intervaloTensionesAux = possibleTensiones;
    let acordeAux = acorde;
    let tensionesApplied = [];

    if (acorde) {
        do {
            // TODO: insted of get random tensiones, get posibles tensiones, order it and then apply in a loop
            // in this way we could avoid distances bigguer than 6m/6M or 11P
            // However distances are checked when a tension is applied
            const tension = getRandom(intervaloTensionesAux);

            if (isTensionApplied(tension, tensionesApplied, acorde, keyNote)) { 
                const result = applyTensionToAcorde(acordeAux, tension, keyNote);
                acordeAux = result.acorde;
                if (result.acordeApplied) tensionesApplied.push(tension);
            }
            
            intervaloTensionesAux = deleteTension(intervaloTensionesAux, tension);
        } while (intervaloTensionesAux.length > 0);
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

const generarAcordeJazz = (encryptedName, keyNote, possibleTensiones, tipo) => {
    const MAX_ITERATION = 15;
    let acorde = null;
    let tensionesApplied = [];
    let tetrada;

    // Get tetrada
    tetrada = generarTetradaJazz(encryptedName, keyNote);
    const notesProhibidasEnBajo = getNotesProhibidasEnBajo(encryptedName, keyNote);

    let j = 0;
    do {
        // Get acorde
        acorde = getIncompleteAcordeJazz(tetrada, [], [], notesProhibidasEnBajo);
        acorde = completeAcorde(acorde, tetrada);
        if (possibleTensiones.length > 0) {
            const resultTensiones = addTensiones(acorde, keyNote, possibleTensiones);
            acorde = resultTensiones.acorde;
            tensionesApplied = resultTensiones.tensionesApplied;
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

    return {
        name,
        acorde,
        referenceNote: getReferenceNoteInRange(keyNote + '4'), // just add altura
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

/**
 * 
 * @param {[Object]} dataCamposArmonicos {
    Escala: escalaCampoArmonico.mayor,
    EscalaPrioridad: 1,
    KeyNote: 'C',
    KeyNotePrioridad: 1,
    NombreCifrado: nombreCifrado_TetradaTriada.tetrada_Maj7,
    Tension:
        intervaloTensiones.novenaMayor +
        ', ' +
        intervaloTensiones.tercenaMayor,
    Tipo: acordeType.tetrada,
}
 * @param {[{elem: string, prioridad: int}]} tonality [{elem: 'Do', prioridad: 3}] ¡¡¡ATENCIÓN!!! elem es Do y NO es C
 * @returns acorde = { name: result.name, acorde: result.acorde, tonality: tonality.escala }
 */
const getAcordeJazz = (dataCamposArmonicos, tonality) => {
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

    // get tensiones
    const tensiones = getDifferentsTensiones(nombreCifrado_tension.Tension);

    const alt = ALTERACIONES_ESCALA_DIATONICA.find(x => x.escalaTraducida == tonalitySelected);

    // transpose keyNote to tonalitySelected
    const newNote = transformarAEscalaDiatonica([keyNote], alt.escala); // with alteraciones applied

    const result = generarAcordeJazz(nombreCifrado, newNote[0], tensiones, nombreCifrado_tension.Tipo);

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

// console.log('Maj7 -> ' + generarAcordeJazz('Maj7'));
// console.log('7 -> ' + generarAcordeJazz('7'));
// console.log('m7 -> ' + generarAcordeJazz('m7'));
// console.log('m7b5 -> ' + generarAcordeJazz('m7b5'));
// console.log('AugMaj7 -> ' + generarAcordeJazz('AugMaj7'));
// console.log('07 -> ' + generarAcordeJazz('07'));
// console.log('6 -> ' + generarAcordeJazz('6'));
// console.log('m6 -> ' + generarAcordeJazz('m6'));
// console.log('7(#5) -> ' + generarAcordeJazz('7(#5)'));
// console.log('7(b5 -> ' + generarAcordeJazz('7(b5)'));
// console.log('7sus2 -> ' + generarAcordeJazz('7sus2'));
// console.log('7sus4 -> ' + generarAcordeJazz('7sus4'));
// console.log('6sus2 -> ' + generarAcordeJazz('6sus2'));
// console.log('6sus4 -> ' + generarAcordeJazz('6sus4'));
// console.log('maj7sus2 -> ' + generarAcordeJazz('maj7sus2'));
// console.log('maj7sus4 -> ' + generarAcordeJazz('maj7sus4'));

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


// console.log(printToSee(generarAcordeJazz('Maj7', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('7', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('m7', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('m7b5', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('AugMaj7', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('07', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('6', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('m6', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('7(#5)', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('7(b5)', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('7sus2', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('7sus4', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('6sus2', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('6sus4', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('maj7sus2', getRandom(SIMPLE_NOTES), intervaloTensiones)));
// console.log(printToSee(generarAcordeJazz('maj7sus4', getRandom(SIMPLE_NOTES), intervaloTensiones)));


// console.log('----------------------------------------')
// console.log('TÉTRADAS')
// console.log('----------------------------------------')
// console.log(printToSee(generarAcordeJazzFromNote('C', acordeType.tetrada)));
// console.log(printToSee(generarAcordeJazzFromNote('D', acordeType.tetrada)));
// console.log(printToSee(generarAcordeJazzFromNote('E', acordeType.tetrada)));
// console.log(printToSee(generarAcordeJazzFromNote('F', acordeType.tetrada)));
// console.log(printToSee(generarAcordeJazzFromNote('G', acordeType.tetrada)));
// console.log(printToSee(generarAcordeJazzFromNote('A', acordeType.tetrada)));
// console.log(printToSee(generarAcordeJazzFromNote('B', acordeType.tetrada)));

// console.log('----------------------------------------')
// console.log('TRÍADAS')
// console.log('----------------------------------------')
// console.log(printToSee(generarAcordeJazzFromNote('C', acordeType.triada)));
// console.log(printToSee(generarAcordeJazzFromNote('D', acordeType.triada)));
// console.log(printToSee(generarAcordeJazzFromNote('E', acordeType.triada)));
// console.log(printToSee(generarAcordeJazzFromNote('F', acordeType.triada)));
// console.log(printToSee(generarAcordeJazzFromNote('G', acordeType.triada)));
// console.log(printToSee(generarAcordeJazzFromNote('A', acordeType.triada)));
// console.log(printToSee(generarAcordeJazzFromNote('B', acordeType.triada)));


// console.log(generarAcordeJazzFromNote('C', acordeType.tetrada));
// console.log(generarTetradaJazz('Maj7', 'C'));
