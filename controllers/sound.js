const fs = require('fs');
const path = require('path');
const { Midi } = require('@tonejs/midi');
const MidiWriter = require('midi-writer-js');
const { exec } = require('child_process');

const cte = require('../services/constants');
const comands = require('../services/comands');
const funcGralDictado = require('../services/funcsGralDictados');

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
                console.log('EXISTE MIDI FILE');
                res.sendFile(path.resolve(filePath));
            }
        });
    } catch (error) {
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
                    figsSeparadas.forEach((f) => {
                        res.push(f);
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

                track.addNote({
                    name: nota,
                    time: timeStart + timePartialSec,
                    duration: figuraSec,
                });

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
            compasSec * 2
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
        console.log(error.message);
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
};
