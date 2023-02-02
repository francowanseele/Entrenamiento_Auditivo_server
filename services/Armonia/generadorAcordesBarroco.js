const { Interval } = require('@tonaljs/tonal');

const {
    voices,
    upperVoice,
    notesInBajo,
    notesInTenor,
    notesInContraAlto,
    notesInSoprano,
    getVoiceByIndexInArray,
} = require('../../enums/voices');
const {
    getRandom,
    removeItemFromArr,
    removeAllItemsFromArr,
} = require('../Dictados_FuncGral/funcionesGenerales');
const { acordes } = require('./dataAcordesBarroco');
const { lessOrEqualThan, destructuringNote, removeAltura } = require('./generadorAcordesServices');

/**
 *
 * @param {Eb} note
 * @param {voices.bajo} voiceType
 * @param {[Eb2]} notesToAvoid
 * @returns Eb3 -> choose the number depending on the voiceType range.
 * if notesToAvoid.length > 0 -> return note with different altura that notes in notesToAvoid
 */
const getAltura = (note, voiceType, notesToAvoid) => {
    const notes = getNotesFromVoiceType(voiceType).filter(
        (noteFromVoiceType) => removeAltura(noteFromVoiceType) == note
    ); // [Eb2, Eb3]

    const availableNotes = notes.filter((n) => !notesToAvoid.includes(n)); // [Eb3]

    return getRandom(availableNotes); // if availableNotes.length == 0 -> return null
};

const getNotesFromVoiceType = (voiceType) => {
    switch (voiceType) {
        case voices.bajo:
            return notesInBajo;
        case voices.tenor:
            return notesInTenor;
        case voices.contraAlto:
            return notesInContraAlto;
        default:
            return notesInSoprano;
    }
};

/**
 *
 * @param {[C, D, F]} allNotes
 * @returns F3 -> must choosed depending on the restrictions
 * If not exists note which can select -> return null
 */
const getNote = (allNotes, voiceType, previousNote) => {
    if (allNotes.length == 0) return null;

    let noteResult = null;

    let allNotesToIterate = JSON.parse(JSON.stringify(allNotes));
    do {
        // Get random note
        const randomNoteName = getRandom(allNotesToIterate);

        let notesToAvoid = [];
        let noteToTry = null;
        do {
            // Get different altura
            noteToTry = getAltura(randomNoteName, voiceType, notesToAvoid);
            if (noteToTry) {
                notesToAvoid.push(noteToTry);

                // Check overlap and distances
                const notesFromVoiceType = getNotesFromVoiceType(voiceType);
                const checkOverlapNotes =
                    lessOrEqualThan(previousNote, noteToTry) &&
                    lessOrEqualThan(
                        noteToTry,
                        notesFromVoiceType[notesFromVoiceType.length - 1]
                    );

                const checkDistanceNotes = checkDistance(
                    previousNote,
                    noteToTry,
                    voiceType
                );

                if (checkOverlapNotes && checkDistanceNotes) {
                    noteResult = noteToTry;
                }
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
 * @param {Cm} acordeName
 * @param {C} noteStart
 * @returns return true if notaInferior from acorde acordeName is the same that noteStart
 * else return false
 */
const checkLowerNote = (acordeName, noteStart) => {
    const acorde = acordes.find((n) => n.name == acordeName);
    if (!acorde) return false;

    const estado = acorde.estado.find(
        (e) => e.notaInferior == removeAltura(noteStart)
    );

    if (estado) {
        return true;
    } else {
        return false;
    }
};

/**
 *
 * @param {Cm} acordeName
 * @param {[C2, Eb2, C3, C4]} acordeNotes
 * @returns true if all elements in acorde.notas are in acordeNotes
 */
const checkNotesHasToBe = (acordeName, acordeNotes) => {
    const acorde = acordes.find((n) => n.name == acordeName);
    if (!acorde) return false;

    var result = true;
    acorde.notas.forEach((note) => {
        const found = acordeNotes.find((a) => removeAltura(a) == note);

        if (!found) {
            result = false;
        }
    });

    return result;
};

/**
 *
 * @param {[Eb3, C4, D5, F5]} acordeNotes
 * @returns return true if each note belongs to each voices type (tesitura)
 */
const checkNotesWithVoicesTypes = (acordeNotes) => {
    if (acordeNotes.length < 4) return false;

    return (
        lessOrEqualThan(acordeNotes[0], notesInBajo[notesInBajo.length - 1]) &&
        lessOrEqualThan(notesInBajo[0], acordeNotes[0]) &&
        lessOrEqualThan(
            acordeNotes[1],
            notesInTenor[notesInTenor.length - 1]
        ) &&
        lessOrEqualThan(notesInTenor[0], acordeNotes[1]) &&
        lessOrEqualThan(
            acordeNotes[2],
            notesInContraAlto[notesInContraAlto.length - 1]
        ) &&
        lessOrEqualThan(notesInContraAlto[0], acordeNotes[2]) &&
        lessOrEqualThan(
            acordeNotes[3],
            notesInSoprano[notesInSoprano.length - 1]
        ) &&
        lessOrEqualThan(notesInSoprano[0], acordeNotes[3])
    );
};

/**
 *
 * @param {[Eb3, C4, D5, F5]} acordeNotes
 * @returns return true if there is no note which overlap with others, in base to voices type
 */
const checkNotesOverlap = (acordeNotes) => {
    return (
        lessOrEqualThan(acordeNotes[0], acordeNotes[1]) &&
        lessOrEqualThan(acordeNotes[1], acordeNotes[2]) &&
        lessOrEqualThan(acordeNotes[2], acordeNotes[3])
    );
};

/**
 *
 * @param {C4} note1
 * @param {F4} note2
 * @param {voice.soprano} voiceType
 * @returns return if the distance is correct due to voice type
 */
const checkDistance = (note1, note2, voiceType) => {
    if (voiceType == voices.bajo) {
        return (
            Interval.add(Interval.distance(note2, note1), '12P').charAt(0) !=
            '-'
        );
    } else {
        return (
            Interval.add(Interval.distance(note2, note1), '8P').charAt(0) != '-'
        );
    }
};

/**
 *
 * @param {[Eb3, C4, D5, F5]} acordeNotes
 * @returns return true if distance between bajo and tenor <= 8J + 5J = 12J
 * && tenor and contraAlto && contraAlto and soprano <= 8J
 */
const checkDistances = (acordeNotes) => {
    return (
        Interval.add(
            Interval.distance(acordeNotes[1], acordeNotes[0]),
            '12P'
        ).charAt(0) != '-' &&
        Interval.add(
            Interval.distance(acordeNotes[2], acordeNotes[1]),
            '8P'
        ).charAt(0) != '-' &&
        Interval.add(
            Interval.distance(acordeNotes[3], acordeNotes[2]),
            '8P'
        ).charAt(0) != '-'
    );
};

/**
 *
 * @param {Cm} acordeName
 * @param {[C2, Eb3, G4, G4]} acorde -> it could be a bad example
 */
const isValidAcorde = (acordeName, acordeNotes) => {
    // Check length
    if (acordeNotes.length < 4) return false;

    // Check lower note
    if (!checkLowerNote(acordeName, acordeNotes[0])) return false;

    // Check each note belongs to correct voice type
    if (!checkNotesWithVoicesTypes(acordeNotes)) return false;

    // Check each note not overlap with others
    if (!checkNotesOverlap(acordeNotes)) return false;

    // Check distances
    if (!checkDistances(acordeNotes)) return false;

    // Check if all notes appear
    if (!checkNotesHasToBe(acordeName, acordeNotes)) return false;

    return true;
};

/**
 *
 * @param {Cm} acordeName
 * @param {[C2, Eb3, C4, Eb4]} acorde
 * @param {1} index
 * @param {G} noteToInsert
 * @returns Insert GX where X is an altura, in the position 1 of array -> resut = C2, GX, C4, Eb4
 */
const tryWithNote = (acordeName, acorde, index, noteToInsert) => {
    const voiceType = getVoiceByIndexInArray(index);

    var acordeResult = acorde;
    var notesToAvoid = [];
    var noteToTry = null;
    var acordeOk = false;
    do {
        noteToTry = getAltura(noteToInsert, voiceType, notesToAvoid);
        notesToAvoid.push(noteToTry);

        if (noteToTry) {
            acordeResult[index] = noteToTry;

            if (
                acordeResult.length == 4 &&
                checkLowerNote(acordeName, acordeResult[0]) &&
                checkNotesWithVoicesTypes(acordeResult) &&
                checkNotesOverlap(acordeResult) &&
                checkDistances(acordeResult)
            ) {
                acordeOk = true;
            }
        }
    } while (noteToTry && !acordeOk);

    if (acordeOk) {
        return acordeResult;
    } else {
        return null;
    }
};

/**
 *
 * @param {Cm} acordeName
 * @param {[C2, Eb3, C4, Eb4]} acorde
 * @param {[C, Eb, G]} notesHasToBe
 * @returns [C2, Eb3, G3, Eb4]
 */
const fixAcorde = (acordeName, acorde, notesHasToBe) => {
    if (acorde.length == 4) {
        var notesMissing = [];
        notesHasToBe.forEach((n) => {
            const found = acorde.find((a) => a.includes(n));

            if (!found) {
                notesMissing.push(n);
            }
        });

        if (notesMissing.length == 0) return acorde;

        var acordeResult = acorde;
        notesMissing.forEach((note) => {
            var remplaced = false;
            for (let i = 1; i < acordeResult.length && !remplaced; i++) {
                const repeatedNotes = acordeResult.filter(
                    (a) => removeAltura(a) == removeAltura(acordeResult[i])
                );

                if (repeatedNotes.length > 1) {
                    // Try to remplace note from array for missing note
                    const newAcorde = tryWithNote(
                        acordeName,
                        acordeResult,
                        i,
                        note
                    );

                    if (newAcorde) {
                        acordeResult = newAcorde;
                        remplaced = true;
                    }
                }
            }
        });

        return acordeResult;
    } else {
        return acorde;
    }
};

/**
 *
 * @param {['C', 'G', 'C', 'G']} allNotes todas las notas del acrode (menos la notaInferior - nota -) y todas las notas que duplica
 * @param {E} note
 * @param {bajo} voiceType sacada del enum voices
 * @param {[]} acordeResult
 * @returns acordeResult -> if it is a valid acorde
 */
const getNextNoteAcorde = (
    acordeName,
    notes,
    allNotes,
    voiceType,
    acordeResult
) => {
    // Success -> Stop condition
    if (isValidAcorde(acordeName, fixAcorde(acordeName, acordeResult, notes)))
        return { ok: true, acorde: acordeResult };

    // Fail -> Stop condition
    if (voiceType == null || allNotes.length == 0) return { ok: false };

    let result = { ok: false };

    // Try with differentes notes
    let allNotesToIterate = JSON.parse(JSON.stringify(allNotes));
    let note = null;
    do {
        note = getNote(
            allNotesToIterate,
            voiceType,
            acordeResult[acordeResult.length - 1]
        );
        if (note) {
            // Try with differentes alturas
            let noteToTry = note;
            let notesToAvoid = [];
            do {
                result = getNextNoteAcorde(
                    acordeName,
                    notes,
                    removeItemFromArr(allNotes, removeAltura(noteToTry)),
                    upperVoice(voiceType),
                    acordeResult.concat([noteToTry])
                );

                if (!result.ok) {
                    const destructuredNote = destructuringNote(noteToTry);
                    notesToAvoid.push(noteToTry);
                    noteToTry = getAltura(
                        destructuredNote.note + destructuredNote.alteracion,
                        voiceType,
                        notesToAvoid
                    );
                }
            } while (noteToTry && !result.ok);

            allNotesToIterate = removeAllItemsFromArr(
                allNotesToIterate,
                removeAltura(note)
            );
        }
    } while (allNotesToIterate.length > 0 && !result.ok && note != null);

    return result;
};

const generarAcordesBarroco = (name) => {
    const acorde = acordes.find((e) => e.name == name);

    // select status
    const acordeEstado = getRandom(acorde.estado);

    let allNotes = acorde.notas.filter(
        (note) => note != acordeEstado.notaInferior
    );

    allNotes = allNotes.concat(acordeEstado.duplica);

    const note = getAltura(acordeEstado.notaInferior, voices.bajo, []);

    return getNextNoteAcorde(
        acorde.name,
        acorde.notas,
        allNotes,
        upperVoice(voices.bajo),
        [note]
    );
};

console.log(generarAcordesBarroco('Cm').acorde);
console.log(generarAcordesBarroco('C').acorde);

module.exports = {
    generarAcordesBarroco,
};
