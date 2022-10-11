const { Interval } = require('@tonaljs/tonal');

/**
 *
 * @param {D2} note1
 * @param {E3} note2
 * @returns if note1 <= note2 -> return true else false
 */
const lessOrEqualThan = (note1, note2) => {
    return Interval.distance(note1, note2).charAt(0) != '-';
};

/**
 *
 * @param {E#2 || E# || Ebb4 || Ebb} note
 * @returns {{note: E, alteracion: bb, altura: 4} || {note: E, alteracion: bb, altura: ''}}
 */
const destructuringNote = (note) => {
    if (
        note.charAt(note.length - 1) == 'b' ||
        note.charAt(note.length - 1) == '#'
    ) {
        // Format = Eb || Ebb || E#
        return {
            note: note.charAt(0),
            alteracion: note.slice(1, note.length),
            altura: '',
        };
    } else {
        // Format = Ebb4 || E#2
        return {
            note: note.charAt(0),
            alteracion: note.slice(1, note.length - 1),
            altura: note.length > 1 ? note.charAt(note.length - 1) : '',
        };
    }
};

/**
 *
 * @param {D4} note
 * @returns D -> remove last char (altura)
 */
 const removeAltura = (note) => {
    return note.slice(0, -1);
};

module.exports = {
    lessOrEqualThan,
    destructuringNote,
    removeAltura,
};
