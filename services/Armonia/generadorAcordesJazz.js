const { Note, Interval } = require('@tonaljs/tonal');
const { getHigherNote, getLowerNote, voices } = require('../../enums/voicesJazz');
const { getRandom, removeAllItemsFromArr, subtractArrays } = require('../Dictados_FuncGral/funcionesGenerales');
const { acordesJazz } = require('./dataAcordesJazz');
const { SIMPLE_NOTES } = require('./dataNotes');
const { lessOrEqualThan, destructuringNote, removeAltura } = require('./generadorAcordesServices');

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

/**
 * 
 * @param { 'A2', 'G#3', 'C#4', 'E4' ]} acorde 
 * @param {1} i 
 * @param {[A3]} notesToAvoid 
 * @param {[A G# C# E]} allNotes 
 * @returns { {acorde: acordeResult,newNotes: newNotes} } check distance between acorde[i] and acorde[i + 1] -> if is not correct try to add notes until distances are ok. Add notes avoiding 2m intervals and checking intervals between any other pair.
 */
const fixDistances = (acorde, i, notesToAvoid, allNotes) => {
    // Avoid 2m intervals
    // Check intervals between any pair
    // if there are not way to fix acorde -> return {acorde: null, newNotes: []}
    // can be added more than one note

    if (!acorde[i + 1]) return acorde;

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
            higherNote: lessOrEqualThan(higherNoteAux, getHigherNote(voices.tensiones)) 
                ? higherNoteAux
                : getHigherNote(voices.tensiones),
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
                currentNote = note;
                added = true;
            } else {
                acordeResult = removeAllItemsFromArr(acordeResult, note);
                notesToAvoidToIteratre.push(note);
            }
            
        } while (!added);

        mustToAddNote =
            Interval.add(Interval.distance(nextNote, currentNote), '6M').charAt(0) == '-' ||
            Interval.add(Interval.distance(nextNote, currentNote), '6m').charAt(0) == '-';
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

        if (fixedConsecutivePairResult.action == 'deleted') {
            console.log('one note was delted.....');
            acordeResult = fixDistances(acordeResult, i, [], allNotes).acorde;
            
            if (acordeResult == null) return null;
        }

        i++;
    } while (acordeResult != null && i < acordeResult.length - 1);

    // Check all notes be in acordeResult
    const notesToAdd = getMissingNotes(acordeResult, allNotes); // TODO:

    const noteRange = {
        higherNote: getHigherNote(voices.tensiones),
        lowerNote: getLowerNote(voices.tetrada_triada),
    };
    notesToAdd.forEach((n) => {
        let notesToAvoid = [];
        let noteToTry = null;
        let noteResult = null;
        do {
            // Get different altura
            noteToTry = getAltura(n, null, notesToAvoid, noteRange);

            if (noteToTry) {
                notesToAvoid.push(noteToTry);
                noteResult = noteToTry;
            }
        } while (noteResult == null && noteToTry != null);

        if (noteResult) {
            acordeResult = insertInOrder(acordeResult, noteResult);
        }
    });

    return acordeResult;
}

/**
 * 
 * @param {['A2', 'Eb3', 'Bbb5']} acorde -> acorde has to be in order
 * @returns 'ok' | 'fail' | 'next_3M'
 */
const checkProhibitedIntervals = (acorde) => {
    /**
     * Entre voces consecutivas: 2m (*solo puede existir si: 
     *  existe otra nota consecutiva más aguda, que esté a una 4j y 3M de las notas que 
     *  conforman la 2m)
     * ------------------------------
     * Entre cualquier par de voces: 9m ni sus octavas, ya sean notas consecutivas o no. 
     *  (solo puede existir contra el bajo)
     */

    if (acorde.length == 0 || acorde.length == 1) return 'ok'

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

    if (ok) {
        // check consecutive notes
        let result = 'ok';
        for (let i = 0; i < acorde.length - 1 && result == 'ok'; i++) {            
            if (Interval.distance(acorde[i], acorde[i + 1]) == '2m') {
                if (acorde[i + 2]) {
                    if (
                        !(
                            Interval.distance(acorde[i + 1], acorde[i + 2]) ==
                                '3M' &&
                            Interval.distance(acorde[i], acorde[i + 2]) == '4P'
                        )
                    ) {
                        result = 'fail';
                    }
                } else {
                    if (acorde.length < 4) {
                        result = 'next_3M';
                    } else {
                        result = 'fail';
                    }
                }
            }
        }

        return result;
    } else { 
        return 'fail';
    }
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

    let result = 'ok';
    let i = 0;
    for (i = 0; i < acorde.length - 1 && result == 'ok'; i++) {            
        if (Interval.distance(acorde[i], acorde[i + 1]) == '2m') {
            if (acorde[i + 2]) {
                if (
                    !(
                        Interval.distance(acorde[i + 1], acorde[i + 2]) == '3M' 
                        && Interval.distance(acorde[i], acorde[i + 2]) == '4P'
                    )
                ) {
                    result = 'fail';
                }
            } else {
                result = 'next_3M';
            }
        }
    }

    return {
        status: result,
        position: i,
    };
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
 * @returns recursive function. Returns an acorde with a minimum of 4 notes, with all notes of allNotes. 
 *          This functions don't check consecutive distances.
 */
const getIncompleteAcordeJazz = (allNotes, acorde, notesNamesToAvoid) => {
    // Check if acorde is ok or fail
    const status = checkProhibitedIntervalsBetweenAnyPair(acorde);
    if (!status) return null;
    if (status && acorde.length == 4) return acorde;

    // New note
    let note = getNote(
        subtractArrays(allNotes, notesNamesToAvoid),
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
        []
    );

    if (acordeResult) return acordeResult;

    // Recursive with the same acorde but new note will be avoided as next note in acorde
    return getIncompleteAcordeJazz(allNotes, acorde, [removeAltura(note)]);
};

const generarAcordeJazz = (encryptedName) => {
    const MAX_ITERATION = 15;
    let acorde = null;

    let i = 0;
    do {    
        // Get tetrada
        const keyNote = getRandom(SIMPLE_NOTES);
        const tetrada = generarTetradaJazz(encryptedName, keyNote);

        let j = 0;
        do {
            // Get acorde
            acorde = getIncompleteAcordeJazz(tetrada, [], []);
            acorde = completeAcorde(acorde, tetrada);
            i++;
        } while (acorde == null && j < MAX_ITERATION);

    } while (acorde == null && i < MAX_ITERATION);

    return acorde;
}

module.exports = {
    generarTetradaJazz,
    generarAcordeJazz,
};

console.log('Maj7 -> ' + generarAcordeJazz('Maj7'));
console.log('7 -> ' + generarAcordeJazz('7'));
console.log('m7 -> ' + generarAcordeJazz('m7'));
console.log('m7b5 -> ' + generarAcordeJazz('m7b5'));
console.log('AugMaj7 -> ' + generarAcordeJazz('AugMaj7'));
console.log('07 -> ' + generarAcordeJazz('07'));
console.log('6 -> ' + generarAcordeJazz('6'));
console.log('m6 -> ' + generarAcordeJazz('m6'));
console.log('7(#5) -> ' + generarAcordeJazz('7(#5)'));
console.log('7(b5 -> ' + generarAcordeJazz('7(b5)'));
console.log('7sus2 -> ' + generarAcordeJazz('7sus2'));
console.log('7sus4 -> ' + generarAcordeJazz('7sus4'));
console.log('6sus2 -> ' + generarAcordeJazz('6sus2'));
console.log('6sus4 -> ' + generarAcordeJazz('6sus4'));
console.log('maj7sus2 -> ' + generarAcordeJazz('maj7sus2'));
console.log('maj7sus4 -> ' + generarAcordeJazz('maj7sus4'));

// ------------------------------------------------------------
// THIS ACORDE CAN NOT BE COMPLETED
// ------------------------------------------------------------
// console.log(completeAcorde([ 'F2', 'E4', 'A4', 'C5' ], [ 'F', 'A', 'C', 'E' ]));
// ------------------------------------------------------------

// console.log('Maj7 -> ');
// console.log('7 -> ');
// console.log('m7 -> ');
// console.log('m7b5 -> ');
// console.log('AugMaj7 -> ');
// console.log('07 -> ');
// console.log('6 -> ');
// console.log('m6 -> ');
// console.log('7(#5) -> ');
// console.log('7(b5 -> ');
// console.log('7sus2 -> ');
// console.log('7sus4 -> ');
// console.log('6sus2 -> ');
// console.log('6sus4 -> ');
// console.log('maj7sus2 -> ');
// console.log('maj7sus4 -> ');

// console.log(generarAcordeJazz('Maj7'));
// console.log(generarAcordeJazz('7'));
// console.log(generarAcordeJazz('m7'));
// console.log(generarAcordeJazz('m7b5'));
// console.log(generarAcordeJazz('AugMaj7'));
// console.log(generarAcordeJazz('07'));
// console.log(generarAcordeJazz('6'));
// console.log(generarAcordeJazz('m6'));
// console.log(generarAcordeJazz('7(#5)'));
// console.log(generarAcordeJazz('7(b5)'));
// console.log(generarAcordeJazz('7sus2'));
// console.log(generarAcordeJazz('7sus4'));
// console.log(generarAcordeJazz('6sus2'));
// console.log(generarAcordeJazz('6sus4'));
// console.log(generarAcordeJazz('maj7sus2'));
// console.log(generarAcordeJazz('maj7sus4'));
