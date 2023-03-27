const fs = require('fs');
const path = require('path');
const { Midi } = require('@tonejs/midi');
const MidiWriter = require('midi-writer-js');
const { exec } = require('child_process');

const cte = require('../services/constants');
const comands = require('../services/comands');
const funcGralDictado = require('../services/funcsGralDictados');
const { logError } = require('../services/errorService');
const { getAuthenticationToken } = require('../services/headers');
const { tipoIntervalo } = require('../enums/tipoIntervalo');

function tramsitDictation(req, res) {
    try {
        const { id } = req.params;
        const nameFileMidi = id.toString();
        const nameFileMp3 = nameFileMidi + '_out';

        const filePath = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3}.mp3`;

        fs.exists(filePath, (exists) => {
            if (!exists) {
                res.status(404).send({
                    ok: false,
                    message: 'El archivo no existe',
                });
            } else {
                res.sendFile(path.resolve(filePath));
            }
        });
    } catch (error) {
        logError('tramsitDictation', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

function tramsitNoteReference(req, res) {
    try {
        const { id } = req.params;
        const nameFileMidi = id.toString();
        const nameFileMp3 = nameFileMidi + '_note_ref_out';

        const filePath = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3}.mp3`;

        // const nameFileMp3 = nameFileMidi + '_note_ref';

        // const filePath = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3}.mid`;

        fs.exists(filePath, (exists) => {
            if (!exists) {
                console.log('NOT EXISTE MIDI FILE');
                res.status(404).send({
                    ok: false,
                    message: 'El archivo no existe',
                });
            } else {
                // console.log('EXISTE MIDI FILE');
                res.sendFile(path.resolve(filePath));
            }
        });
    } catch (error) {
        logError('tramsitNoteReference', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

function generateDictationFile(req, res) {
    try {
        const getFigurasALL = (conjuntoFiguras) => {
            var res = [];
            conjuntoFiguras.forEach((figuras) => {
                figuras.forEach((fig) => {
                    const figsSeparadas = fig.split('-');
                    let firstFiguras = true;
                    figsSeparadas.forEach((f) => {
                        if (
                            firstFiguras &&
                            f.indexOf('_') == 0 &&
                            res.length > 0
                        ) {
                            const lastFigure = res[res.length - 1];
                            res.pop();
                            const newFigure = lastFigure + f;
                            res.push(newFigure);
                        } else {
                            res.push(f);
                        }
                        firstFiguras = false;
                    });
                });
            });

            return res;
        };

        const trackStickSound = (track, numerador, pulsoSec, timeStart) => {
            track.addNote({
                midi: 120,
                time: 0,
                duration: timeStart,
            });

            for (let i = 0; i < numerador; i++) {
                track.addNote({
                    midi: 31,
                    time: timeStart + pulsoSec * i,
                    duration: pulsoSec,
                });
            }

            trackSticks.channel = 9;
            trackSticks.instrument.number = 9;

            return track;
        };

        const trackDictationSound = (
            figurasDictadoSec,
            notasDictado,
            track,
            timeStart
        ) => {
            var timePartialSec = 0;
            for (let i = 0; i < notasDictado.length; i++) {
                const nota = notasDictado[i];
                const figuraSec = figurasDictadoSec[i];

                if (nota == 'S') {
                    // Silence
                    track.addNote({
                        midi: 0,
                        time: timeStart + timePartialSec,
                        duration: figuraSec,
                    });
                } else {
                    track.addNote({
                        name: nota,
                        time: timeStart + timePartialSec,
                        duration: figuraSec,
                    });
                }

                timePartialSec += figuraSec;
            }

            return track;
        };

        const {
            dictado,
            figurasDictado,
            escalaDiatoica,
            bpm,
            nota_base,
            numerador,
            denominador,
        } = req.body;
        const { id } = req.params;

        //#region VAR
        // ----------------------------------------------
        const notasDictado = funcGralDictado.applyTransformation(
            dictado,
            escalaDiatoica
        );
        const negraSec = funcGralDictado.bpmToSec(bpm);
        const pulsoSec = funcGralDictado.translateFigToSec(
            denominador,
            negraSec
        );
        const compasSec = funcGralDictado.getCompasSec(numerador, pulsoSec);
        const dictadoFigurasSec = funcGralDictado.translateDictadoFigToSec(
            getFigurasALL(figurasDictado),
            negraSec
        );
        // console.log('--------------------------------------');
        // console.log('Figuras del dictado');
        // console.log(figurasDictado);
        // console.log('get all figures');
        // console.log(getFigurasALL(figurasDictado));
        // console.log('-------- NOTAS ------');
        // console.log(notasDictado);
        // console.log('--------------------------------------');
        // ----------------------------------------------
        //#endregion

        //#region Generate TRACKS
        // ----------------------------------------------
        var midi = new Midi();
        var trackSticks = midi.addTrack();
        trackSticks = trackStickSound(
            trackSticks,
            numerador,
            pulsoSec,
            compasSec
        ); 

        var trackDictation = midi.addTrack();
        trackDictation = trackDictationSound(
            dictadoFigurasSec,
            notasDictado,
            trackDictation,
            compasSec * 2 // indica que arranque luego del sonido de los sticks (que tiene una duración de 1 compasSec)
        );
        // ----------------------------------------------
        //#endregion

        //#region Reference Note
        // ----------------------------------------------
        const referenceNoteTransformed = funcGralDictado.applyTransformation(
            [nota_base],
            escalaDiatoica
        );

        var midiReference = new Midi();
        var trackReferenceNote = midiReference.addTrack();
        trackReferenceNote = trackDictationSound(
            ['1'],
            referenceNoteTransformed,
            trackReferenceNote,
            0
        );
        // ----------------------------------------------
        //#endregion

        //#region Generate File
        // ----------------------------------------------

        // -------------
        // Dictado
        // -------------
        const nameFileMidi = id.toString();
        const nameFileMp3 = nameFileMidi + '_out';
        fs.writeFileSync(
            `${cte.LOCATION_MUSIC_FILE}${nameFileMidi}.mid`,
            new Buffer(midi.toArray())
        );

        // Dictado -> if exist file mp3 DELETE
        const filePathMp3 = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3}.mp3`;
        fs.exists(filePathMp3, (exists) => {
            if (exists) {
                fs.unlinkSync(filePathMp3);
            }
        });

        // Dictado -> Midi to mp3
        const comand = comands.miditomp3(nameFileMidi, nameFileMp3);
        exec(comand);

        // -------------
        // Reference note
        // -------------
        const nameFileMidiNoteRef = id.toString() + '_note_ref';
        const nameFileMp3NoteRef = nameFileMidiNoteRef + '_out';
        fs.writeFileSync(
            `${cte.LOCATION_MUSIC_FILE}${nameFileMidiNoteRef}.mid`,
            new Buffer(midiReference.toArray())
        );

        // Reference note -> if exist file mp3 DELETE
        const filePathMp3NoteRef = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3NoteRef}.mp3`;
        fs.exists(filePathMp3NoteRef, (exists) => {
            if (exists) {
                fs.unlinkSync(filePathMp3NoteRef);
            }
        });

        // Reference note -> Midi to mp3
        // convert midi to mp3 Note Ref
        const comandNoteRef = comands.miditomp3(
            nameFileMidiNoteRef,
            nameFileMp3NoteRef
        );
        exec(comandNoteRef);

        // ----------------------------------------------
        //#endregion

        res.status(200).send({
            ok: true,
            dictadoTransformado: notasDictado,
            message:
                'Generación correcta de los dictados en archivos .mid y .mp3.',
        });
    } catch (error) {
        logError('generateDictationFile', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

function generateAcordeJazzFile(req, res) {
    try {
        const trackAcordeSound = (track, notesArray) => {
            track.addNote({
                midi: 120,
                time: 0,
                duration: 1,
            })

            notesArray.forEach(n => {
                track.addNote({
                    name: n,
                    time: 1,
                    duration: 2,
                });
            });

            return track;
        };

        const { notes, referenceNote } = req.body; // ex: Ab2,Bb3,C4,Db4,F4
        const id = getAuthenticationToken(req).id;

        // ACORDE
        var midi = new Midi();
        var track = midi.addTrack();
        track = trackAcordeSound(
            track,
            notes.split(',')
        );

        // NOTE REF
        var midiReferenceNote = new Midi();
        var trackReferenceNote = midiReferenceNote.addTrack();
        trackReferenceNote = trackAcordeSound(
            trackReferenceNote,
            [referenceNote]
        );

        // ACORDE
        const nameFileMidi = id.toString();
        const nameFileMp3 = nameFileMidi + '_out';
        fs.writeFileSync(
            `${cte.LOCATION_MUSIC_FILE}${nameFileMidi}.mid`,
            new Buffer(midi.toArray())
        );

        // NOTE REF
        const nameFileMidi_noteRef = id.toString() + '_note_ref';
        const nameFileMp3_noteRef = nameFileMidi_noteRef + '_out';
        fs.writeFileSync(
            `${cte.LOCATION_MUSIC_FILE}${nameFileMidi_noteRef}.mid`,
            new Buffer(midiReferenceNote.toArray())
        );

        //ACORDE
        // Dictado -> if exist file mp3 DELETE
        const filePathMp3 = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3}.mp3`;
        fs.exists(filePathMp3, (exists) => {
            if (exists) {
                fs.unlinkSync(filePathMp3);
            }
        });

        // NOTE REF
        // Dictado -> if exist file mp3 DELETE
        const filePathMp3_noteRef = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3_noteRef}.mp3`;
        fs.exists(filePathMp3_noteRef, (exists) => {
            if (exists) {
                fs.unlinkSync(filePathMp3_noteRef);
            }
        });

        // ACORDE
        // Dictado -> Midi to mp3
        const comand = comands.miditomp3(nameFileMidi, nameFileMp3);
        exec(comand);

        // NOTE REF
        // Dictado -> Midi to mp3
        const comand_noteRef = comands.miditomp3(nameFileMidi_noteRef, nameFileMp3_noteRef);
        exec(comand_noteRef);

        res.status(200).send({
            ok: true,
            message: 'Generación correcta de los acorde en .mid y .mp3.',
        });
    } catch (error) {
        logError('sound/generateAcordeJazzFile', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

function generateIntervaloFile(req, res) {
    try {
        const trackSound = (track, notesArray, type) => {
            track.addNote({
                midi: 120,
                time: 0,
                duration: 1,
            })

            if (type && type == tipoIntervalo.melodico) {
                for (let i = 0; i < notesArray.length; i++) {
                    const n = notesArray[i];
                    track.addNote({
                        name: n,
                        time: i,
                        duration: 1,
                    });
                }
            } else {
                notesArray.forEach(n => {
                    track.addNote({
                        name: n,
                        time: 1,
                        duration: 2,
                    });
                });
            }


            return track;
        };

        const { notes, referenceNote, type } = req.body; // ex: Ab2,Bb3,C4,Db4,F4
        const id = getAuthenticationToken(req).id;

        // Intervalo
        var midi = new Midi();
        var track = midi.addTrack();
        track = trackSound(
            track,
            notes.split(','),
            type
        );

        // NOTE REF
        var midiReferenceNote = new Midi();
        var trackReferenceNote = midiReferenceNote.addTrack();
        trackReferenceNote = trackSound(
            trackReferenceNote,
            [referenceNote]
        );

        // Intervalo
        const nameFileMidi = id.toString();
        const nameFileMp3 = nameFileMidi + '_out';
        fs.writeFileSync(
            `${cte.LOCATION_MUSIC_FILE}${nameFileMidi}.mid`,
            new Buffer(midi.toArray())
        );

        // NOTE REF
        const nameFileMidi_noteRef = id.toString() + '_note_ref';
        const nameFileMp3_noteRef = nameFileMidi_noteRef + '_out';
        fs.writeFileSync(
            `${cte.LOCATION_MUSIC_FILE}${nameFileMidi_noteRef}.mid`,
            new Buffer(midiReferenceNote.toArray())
        );

        //Intervalo
        // Dictado -> if exist file mp3 DELETE
        const filePathMp3 = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3}.mp3`;
        fs.exists(filePathMp3, (exists) => {
            if (exists) {
                fs.unlinkSync(filePathMp3);
            }
        });

        // NOTE REF
        // Dictado -> if exist file mp3 DELETE
        const filePathMp3_noteRef = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3_noteRef}.mp3`;
        fs.exists(filePathMp3_noteRef, (exists) => {
            if (exists) {
                fs.unlinkSync(filePathMp3_noteRef);
            }
        });

        // Intervalo
        // Dictado -> Midi to mp3
        const comand = comands.miditomp3(nameFileMidi, nameFileMp3);
        exec(comand);

        // NOTE REF
        // Dictado -> Midi to mp3
        const comand_noteRef = comands.miditomp3(nameFileMidi_noteRef, nameFileMp3_noteRef);
        exec(comand_noteRef);

        res.status(200).send({
            ok: true,
            message: 'Generación correcta de los Intervalo en .mid y .mp3.',
        });
    } catch (error) {
        logError('sound/generateIntervaloFile', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    generateDictationFile,
    tramsitDictation,
    tramsitNoteReference,
    generateAcordeJazzFile,
    generateIntervaloFile,
};
