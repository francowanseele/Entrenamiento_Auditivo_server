const { Note, Interval } = require('@tonaljs/tonal');
const { NOTAS_BASICAS_NOM_ANGLO } = require('../DictadosMelodicos/constants');
const { ALTERACIONES_ESCALA_DIATONICA } = require('./datosAngloSaxonNomenclature');

/**
 * Ex: nota: Cb3, nroMov: 4 -> return Gb4
 * @param {string} nota note with or without altura. Ex: 'C' or 'C4'
 * @param {int} nroMov number of movements to move the note
 * @returns {string} Note moved.
 */
const getNotaTransformada = (nota, nroMov) => {
    // Letter (ex: C); acc (ex: #) oct (ex: 4)
    let { letter, acc, oct } = Note.get(nota);
    const nombreNota = nota.slice(0, -1);

    const i_origin = NOTAS_BASICAS_NOM_ANGLO.indexOf(letter);

    const i_tarns = (i_origin + nroMov + NOTAS_BASICAS_NOM_ANGLO.length) % NOTAS_BASICAS_NOM_ANGLO.length;

    if (oct) {
        if ((i_origin + nroMov) / NOTAS_BASICAS_NOM_ANGLO.length >= 1) {
            oct++;
        }
        if (i_origin < i_tarns && nroMov < 0) {
            oct--;
        }
    }

    if (oct) {
        return NOTAS_BASICAS_NOM_ANGLO[i_tarns] + acc + oct.toString();
    } else {
        return NOTAS_BASICAS_NOM_ANGLO[i_tarns] + acc;
    }
};

/**
 * 
 * @param {string} noteLetter letter of note. Ex: 'C'
 * @param {[string]} alts Alteraciones from EscalasDiatonicas/datosAngloSaxonNomenclature/ALTERACIONES_ESCALA_DIATONICA.alteracion. 
 *                          Ex: ['C#', 'F#', 'G#']
 * @returns {string} find noteLetter in alts and return the alteracion that has alts.
 */
const getAlteracionEscalaDiatonica = (noteLetter, alts) => {
    let altResult = '';
    alts.forEach(a => {
        const { letter, acc } = Note.get(a);
        if (noteLetter == letter) {
            altResult = acc
        }
    });

    return altResult;
}

/**
 * 
 * @param {[string]} notes notes array. Ex: ['C', 'F', 'G'] or ['C3', 'F3', 'G3']
 * @param {string} tonalidad EscalaDiatónica from EscalasDiatonicas/datosAngloSaxonNomenclature/ALTERACIONES_ESCALA_DIATONICA.escala 
 *                      ex: 'F#'
 * @returns {[string]} notes after apply alteraciones from EscalasDiatonicas/datosAngloSaxonNomenclature/ALTERACIONES_ESCALA_DIATONICA.alteracion
 */
const applyAlteraciones = (notes, tonalidad) => {
    let notesResult = [];
    const altTonalidad = ALTERACIONES_ESCALA_DIATONICA.find(x => x.escala == tonalidad);

    if (!altTonalidad) return null;

    notes.forEach(n => {
        const { letter, acc, oct } = Note.get(n);
        const newAcc = getAlteracionEscalaDiatonica(letter, altTonalidad.alteracion);

        let newNote = '';
        if (oct) {
            newNote = letter + acc + newAcc + oct.toString();
        } else {
            newNote = letter + acc + newAcc;
        }

        notesResult.push(newNote);
    });

    return notesResult;
}

/**
 * Transform notas to tonalidad with alteraciones applied!
 * @param {[string]} notas notas with or without altura ex: ['C', 'E', 'F'] or ['C3', 'E4', 'F4']
 * @param {string} tonalidad EscalaDiatónica from EscalasDiatonicas/datosAngloSaxonNomenclature/ALTERACIONES_ESCALA_DIATONICA.escala 
 *                          ex: 'F#'
 * @returns {[string]} notes array, transformed to TONALIDAD
 */
const transformarAEscalaDiatonica = (notas, tonalidad) => {
    const tonalidadBase = Note.get(tonalidad).letter;
    const nroInvolucrados = Math.abs(Interval.get(Interval.distance('C', tonalidadBase)).simple);

    var nroMovimiento = 0;
    nroInvolucrados > 5
        ? (nroMovimiento = nroInvolucrados - 8)
        : (nroMovimiento = nroInvolucrados - 1);

    var newNotes = [];

    notas.forEach((nota) => {
        const notaTrans = getNotaTransformada(nota, nroMovimiento);
        newNotes.push(notaTrans);
    });

    // TODO: I should not apply alteraciones, because to show in a pentagram, 
    // alteraciones are in the clave
    const notasTransformadas = applyAlteraciones(newNotes, tonalidad);

    // const notasTransformadas = newNotes;

    return notasTransformadas;
};

module.exports = {
    transformarAEscalaDiatonica,
    applyAlteraciones,
}
