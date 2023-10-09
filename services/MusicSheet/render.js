const { createCanvas, writeImage } = require('node-vexflow');
const Vex = require('vexflow');
const { Note } = require('@tonaljs/tonal');

const { ALTERACIONES_ESCALA_DIATONICA } = require('../EscalasDiatonicas/datosAngloSaxonNomenclature');
const { lessOrEqualThan } = require('../Armonia/generadorAcordesServices');
const { LOCATION_MUSIC_SHEET_FILE } = require('../constants');
const { unapplyTonality } = require('../funcsGralDictados');

const getClef = (clef) => {
    switch (clef) {
        case 'Sol':
            return 'treble'
        case 'Fa':
            return 'bass'
        default:
            return ''
    }
}

const getKeySignature = (tonalidad) => {
    return ALTERACIONES_ESCALA_DIATONICA.find(
        (x) => x.escalaTraducida == tonalidad || x.escala == tonalidad
    ).escala
}

/**
 * 
 * @param {[[string]]} figuras ex: [ ['8-8', '8-8'], ['8-8', '8-8'] ]
 * @param {[[string]]} notas ex: [['D3'],['D3', 'C3'],['D3'],['D3'],['D3'],['D3'],['D3'],['D3']]
 * @returns [Object] ex [{figura: '8', notas: ['D3']}, {figura: '8', notas: ['D3', 'C3']}, ....]
 */
const getFigNotes = (figuras, notas) => {
    let figurasResult = []

    figuras.forEach(conjuntoFiguras => {
        conjuntoFiguras.forEach(figs => {
            figurasResult = figurasResult.concat(figs.split('-'))
        });
    });

    if (figurasResult.length != notas.length) {
        console.log('ERROR: MusicSheet/render/GetImage/getFigNotes')
        return null;
    }

    let result = [];

    for (let i = 0; i < figurasResult.length; i++) {
        const fig = figurasResult[i]
        const notes = notas[i]

        result.push({
            figura: fig,
            notas: notes
        })
    }

    return result
}


const getKeyFromNote = (note) => {
    const infoNote = Note.get(note)
    const result = infoNote.letter.toLowerCase() + '/' + infoNote.oct.toString()
    return result;
}

/**
 * 
 * @param {[{figura: string, notas: [string]}]} fig_notes ex: [{figura: '8', notas: ['D3']}, {figura: '8', notas: ['D3', 'C3']}, ....]
 * @param {int} index 
 * @param {int} n 
 * @returns ex: [ { keys: ["c/4", "e/4", "g/4"], duration: "8" }, ...]
 */
const getNotesInBeam = (fig_notes, index, n, clave) => {
    let keys = []
    for (let i = index; i < index + n; i++) {
        const object = fig_notes[i];        
        // TODO: Para acordes, puede que se le tenga que aplicar alteraciones diferentes a cada una de las notas
        const acc = Note.get(object.notas[0]).acc
        if (acc == '') {
            // 
            keys.push(
                new Vex.Flow.StaveNote({
                    clef: getClef(clave),
                    keys: object.notas.map((x) => getKeyFromNote(x)),
                    duration: object.figura,
                })
            )
        } else {
            keys.push(
                new Vex.Flow.StaveNote({
                    clef: getClef(clave),
                    keys: object.notas.map((x) => getKeyFromNote(x)),
                    duration: object.figura,
                }).addModifier(new Vex.Flow.Accidental(acc))
            )
        }
    }

    return keys
}

/**
 * 
 * @param {[[string]]} figuras ex: [ ['8-8', '8-8'], ['8-8', '8-8'] ]
 * @param {[[string]]} notas ex: [['D3'],['D3'],['D3'],['D3'],['D3'],['D3'],['D3'],['D3']]
 * @param {string} numerador ex: 3
 * @param {string} denominador ex: 4
 * @param {string} tonalidad ex: 'Fa'
 * @param {string} clave ex: 'Sol'
 */
const getImage = (figuras, notas, numerador, denominador, tonalidad, clave) => {
    const nroMeasures = figuras.length;
    const canvas = createCanvas();
    const renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
    renderer.resize((nroMeasures * 400) + 20, 200);

    const context = renderer.getContext();
    context.save();
    context.fillStyle = 'white';
    context.fillRect(0, 0, (nroMeasures * 400) + 20, 200);
    context.restore();

    const fig_notes = getFigNotes(figuras, notas);

    let totalWidth = 10
    let fig_notes_i = 0
    for (let m = 0; m < nroMeasures; m++) {
        // Measure (compás)
        const stave = new Vex.Flow.Stave(totalWidth, 0, 400);
        if (m == 0) {
            stave
                .addClef(getClef(clave))
                .addTimeSignature(numerador + '/' + denominador)
                .addKeySignature(getKeySignature(tonalidad));
        }
        totalWidth += 400

        let notesInMeasure = []

        const nroBeamsInMeasure = figuras[m].length // Número de conjuto de figuras
        for (let b_i = 0; b_i < nroBeamsInMeasure; b_i++) {
            // Beam (conjunto de figura)
            const nroFigsPerBeam = figuras[m][b_i].split('-').length

            const notes = getNotesInBeam(fig_notes, fig_notes_i, nroFigsPerBeam, clave)

            notesInMeasure = notesInMeasure.concat(notes)
            fig_notes_i += nroFigsPerBeam
        }
        const beams = Vex.Flow.Beam.generateBeams(notesInMeasure)
        stave.setContext(context).draw();
        Vex.Flow.Formatter.FormatAndDraw(context, stave, notesInMeasure);

        beams.forEach((b) => {
            b.setContext(context).draw();
        });
    }

    writeImage(canvas, 'sample_Sol.png');
}


const getNotesInClef = (notes, clef) => {
    let result = []
    if (clef == 'treble') {
        result = notes.filter((n) => lessOrEqualThan('C4', n))
    } else if (clef == 'bass') {
        result = notes.filter((n) => !lessOrEqualThan('C4', n))
    } 
    
    return result;
}

/**
 * 
 * @param {*} note ex: 'A#3'
 * @param {*} tonality ex: 'C' || 'Do'
 * @returns {b | bb | # | ## | n}
 */
const getAlteracionNoteForTonality = (note, tonality) => {
    const alteraciones = ALTERACIONES_ESCALA_DIATONICA.find(
        (x) => x.escalaTraducida == tonality || x.escala == tonality
    ).alteracion

    let { letter, acc } = Note.get(note);
    let res = acc

    alteraciones.forEach(alteracion => {
        if (letter == Note.get(alteracion).letter) {
            if (acc == 'b' || acc == '#') {
                res = '';
                return res;
            }

            if (acc == '') {
                res = 'n';
                return res;
            }
        }
    });

    return res;
}

/**
 * 
 * @param {[{figura: string, notas: [string]}]} fig_notes ex: [{figura: '8', notas: ['D3']}, {figura: '8', notas: ['D3', 'C3']}, ....]
 * @param {int} index 
 * @param {int} n 
 * @returns ex: [ { keys: ["c/4", "e/4", "g/4"], duration: "8" }, ...]
 */
const getNotesInBeamPerClef = (fig_notes, index, n, tonality) => {
    let keysTreble = []
    let keysBass = []
    for (let i = index; i < index + n; i++) {
        const object = fig_notes[i];
        const notesTreble = getNotesInClef(object.notas, 'treble')
        const notesBass = getNotesInClef(object.notas, 'bass')

        if (notesTreble.length) {
            let noteToAddTreble = new Vex.Flow.StaveNote({
                clef: 'treble',
                keys: notesTreble.map((x) => getKeyFromNote(x)),
                duration: object.figura,
            });
            for (let j = 0; j < notesTreble.length; j++) {
                const note = notesTreble[j];
                // Check alteracion with tonalidad (#, b, or neutral (becuadro))
                const acc = getAlteracionNoteForTonality(note, tonality);
                // const acc = Note.get(note).acc
                if (acc != '') {
                    noteToAddTreble.addModifier(new Vex.Flow.Accidental(acc), j)
                }
            }
            keysTreble.push(noteToAddTreble)
        }

        if (notesBass.length) {
            let noteToAddBass = new Vex.Flow.StaveNote({
                clef: 'bass',
                keys: notesBass.map((x) => getKeyFromNote(x)),
                duration: object.figura,
            });
            for (let j = 0; j < notesBass.length; j++) {
                const note = notesBass[j];
                // Check alteracion with tonalidad (#, b, or neutral (becuadro))
                const acc = getAlteracionNoteForTonality(note, tonality);
                // const acc = Note.get(note).acc
                if (acc != '') {
                    noteToAddBass.addModifier(new Vex.Flow.Accidental(acc), j)
                }
            }
            keysBass.push(noteToAddBass)
        }
    }

    return {
        keysBass: keysBass,
        keysTreble: keysTreble,
    }
}

/**
 * notas estan con alteraciones de tonalidad. Quitar alteraciones para graficar.
 * 
 * @param {[[string]]} notas ex: [['D3'],['D3'],['D3'],['D3'],['D3'],['D3'],['D3'],['D3']]
 * @param {string} tonalidad ex: 'Fa' || 'F'
 * @param {string} fileName 1_music_sheet_reference || 1_music_sheet_solution
 */
const getImageDictadoArmonico = (notas, tonalidad, fileName) => {
    let figuras = Array(notas.length).fill(['1'])
    const numerador = '4'
    const denominador = '4'
    const nroMeasures = figuras.length;
    const canvas = createCanvas();
    const renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);
    renderer.resize((nroMeasures * 200) + 60, 200);

    const context = renderer.getContext();
    context.save();
    context.fillStyle = 'white';
    context.fillRect(0, 0, (nroMeasures * 200) + 70, 200); // 70 = 40 + 30 -> 30 para el primer compás
    context.restore();

    // const notasWithoutTonality = notas.map((x) => unapplyTonality(x, tonalidad))
    // const fig_notes = getFigNotes(figuras, notasWithoutTonality);
    const fig_notes = getFigNotes(figuras, notas);

    let totalWidth = 20
    let fig_notes_i = 0
    for (let m = 0; m < nroMeasures; m++) {
        // Measure (compás)
        const staveTreble = new Vex.Flow.Stave(totalWidth, 0, m == 0 ? 230 : 200); // Se le suma 30 al primer compás
        const staveBass = new Vex.Flow.Stave(totalWidth, 75, m == 0 ? 230 : 200); // Se le suma 30 al primer compás
        if (m == 0) {
            staveTreble
                .addClef('treble')
                .addTimeSignature(numerador + '/' + denominador)
                .addKeySignature(getKeySignature(tonalidad));

            staveBass
                .addClef('bass')
                .addTimeSignature(numerador + '/' + denominador)
                .addKeySignature(getKeySignature(tonalidad));

            totalWidth += 30 // Se suma 30 al primer compás
        }
        totalWidth += 200

        let notesInMeasureTreble = []
        let notesInMeasureBass = []

        const nroBeamsInMeasure = figuras[m].length // Número de conjuto de figuras
        for (let b_i = 0; b_i < nroBeamsInMeasure; b_i++) {
            // Beam (conjunto de figura)
            const nroFigsPerBeam = figuras[m][b_i].split('-').length

            const result = getNotesInBeamPerClef(fig_notes, fig_notes_i, nroFigsPerBeam, tonalidad)

            notesInMeasureTreble = notesInMeasureTreble.concat(result.keysTreble)
            notesInMeasureBass = notesInMeasureBass.concat(result.keysBass)
            fig_notes_i += nroFigsPerBeam
        }
        const beams = Vex.Flow.Beam.generateBeams(notesInMeasureTreble.concat(notesInMeasureBass))

        if (m == 0) {
            var brace = new Vex.Flow.StaveConnector(staveTreble, staveBass).setType(3);
            var lineLeft = new Vex.Flow.StaveConnector(staveTreble, staveBass).setType(1);
            brace.setContext(context).draw();
            lineLeft.setContext(context).draw();
        }
        if (m == nroMeasures - 1) {
            var lineRight = new Vex.Flow.StaveConnector(staveTreble, staveBass).setType(6);
            lineRight.setContext(context).draw();
        }

        staveTreble.setContext(context).draw();
        staveBass.setContext(context).draw();
        
        if (notesInMeasureTreble.length) Vex.Flow.Formatter.FormatAndDraw(context, staveTreble, notesInMeasureTreble);
        if (notesInMeasureBass.length) Vex.Flow.Formatter.FormatAndDraw(context, staveBass, notesInMeasureBass);

        beams.forEach((b) => {
            b.setContext(context).draw();
        });
    }

    writeImage(canvas, './files/musicSheet/' + fileName + '.png');
}

module.exports = {
    getImageDictadoArmonico,
}

// getImageDictadoArmonico(
//     [['D#3','F#3','A3','C#4','G#4'],
//     ['F#2','A3','E4','F#4','C#5'],
//     ['A2','G#3','C#4','E4'],
//     ['F#2','A3','C#4']],
//     "Do",
//     'music_sheet_solution'
// );
