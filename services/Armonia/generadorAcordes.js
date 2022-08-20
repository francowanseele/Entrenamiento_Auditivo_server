const { voices, upperVoice } = require('../../enums/voices');
const {
    getRandom,
    removeItemFromArr,
} = require('../Dictados_FuncGral/funcionesGenerales');
const { acordes } = require('./dataAcordes');

/**
 *
 * @param {C} note
 * @param {voices.bajo} voiceType
 * @param {2} avoid
 * @returns C3 -> choose the number depending on the voiceType range and other restrictions. 
 * if avoid != null -> return note with different altura that avoid
 */
const getAltura = (note, voiceType, avoid) => {
    // TODO:
    return null;
};

/**
 *
 * @param {[C, D, F]} allNotes
 * @returns F -> must choosed depending on the restrictions
 */
const getNote = (allNotes) => {
    // TODO:
    return null;
};

const getNextNoteAcorde = (allNotes, note, voiceType, acordeResult) => {
    // Define stop conditions
    // when have the result

    let noteResult = getAltura(note, voiceType);
    let n = getNote(allNotes);
    let allNotesCopy = allNotes;

    let result = getNextNoteAcorde(
        removeItemFromArr(allNotesCopy, n),
        n,
        upperVoice(voiceType),
        acordeResult.concat([noteResult])
    );

    if (result.ok) return result;

    // Try with different altura
    let noteResult2 = getAltura(note, voiceType, noteResult.slice(-1));
    result = getNextNoteAcorde(
        removeItemFromArr(allNotesCopy, n),
        n,
        upperVoice(voiceType),
        acordeResult.concat([noteResult2])
    );

    if (result.ok) return result;

    let n2 = getNote(removeItemFromArr(allNotesCopy, n));

    // Try with different note
    let allNotesCopy2 = allNotes;
    result = getNextNoteAcorde(
        removeItemFromArr(allNotesCopy2, n2),
        n2,
        upperVoice(voiceType),
        acordeResult.concat([noteResult])
    );

    if (result.ok) return result;

    // Try with different altura
    result = getNextNoteAcorde(
        removeItemFromArr(allNotesCopy2, n2),
        n2,
        upperVoice(voiceType),
        acordeResult.concat([noteResult2])
    );

    if (result.ok) return result;

    return {
        ok: false,
    };
};

const generarAcordes = (name) => {
    const acorde = acordes.find((e) => e.name == name);

    // select status
    const acordeEstado = getRandom(acorde.estado);

    let allNotes = acorde.notas.filter(
        (note) => note != acordeEstado.notaInferior
    );

    allNotes = allNotes.concat(acordeEstado.duplica);

    getNextNoteAcorde(allNotes, acordeEstado.notaInferior, voices.bajo, []);
};
