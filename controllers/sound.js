const fs = require('fs');
const path = require('path');
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
        const addNotes = (track, dictation, figurasDictado, bpm) => {
            // const dictadoTrans = funcGralDictado.translateNotes(dictation);
            const translateToBPM = (figure, bpm) => {
                if (bpm) {
                    const bpm_val = parseInt(bpm);
                    switch (figure) {
                        case '1':
                            return 'T'.concat((bpm_val * 4).toString());
                        case '2':
                            return 'T'.concat((bpm_val * 2).toString());
                        case 'd2':
                            return 'T'.concat(
                                (bpm_val * 2 + bpm_val * 1).toString()
                            );
                        case 'dd2':
                            return 'T'.concat(
                                (
                                    bpm_val * 2 +
                                    bpm_val * 1 +
                                    Math.round(bpm_val / 2)
                                ).toString()
                            );
                        case '4':
                            return 'T'.concat((bpm_val * 1).toString());
                        case 'd4':
                            return 'T'.concat(
                                (
                                    bpm_val * 1 +
                                    Math.round(bpm_val / 2)
                                ).toString()
                            );
                        case 'dd4':
                            return 'T'.concat(
                                (
                                    bpm_val * 1 +
                                    Math.round(bpm_val / 2) +
                                    Math.round(bpm_val / 4)
                                ).toString()
                            );
                        case '8':
                            return 'T'.concat(
                                Math.round(bpm_val / 2).toString()
                            );
                        case 'd8':
                            return 'T'.concat(
                                (
                                    Math.round(bpm_val / 2) +
                                    Math.round(bpm_val / 4)
                                ).toString()
                            );
                        case 'dd8':
                            return 'T'.concat(
                                (
                                    Math.round(bpm_val / 2) +
                                    Math.round(bpm_val / 4) +
                                    Math.round(bpm_val / 8)
                                ).toString()
                            );
                        case '16':
                            return 'T'.concat(
                                Math.round(bpm_val / 4).toString()
                            );
                        case '32':
                            return 'T'.concat(
                                Math.round(bpm_val / 8).toString()
                            );
                        case '64':
                            return 'T'.concat(
                                Math.round(bpm_val / 16).toString()
                            );

                        default:
                            figure;
                            break;
                    }
                } else {
                    return figure;
                }
            };

            for (let i = 0; i < dictation.length; i++) {
                const nota = dictation[i];
                const fig = figurasDictado[i];
                track.addEvent(
                    [
                        new MidiWriter.NoteEvent({
                            pitch: [nota],
                            duration: translateToBPM(fig, bpm),
                            velocity: 100,
                        }),
                    ],
                    function (event, index) {
                        return { sequential: true };
                    }
                );
            }

            return track;
        };

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

        const { dictado, figurasDictado, escalaDiatoica, bpm, nota_base } =
            req.body;
        const { id } = req.params;

        // Dictation
        var track = new MidiWriter.Track();
        const figuras = getFigurasALL(figurasDictado);
        const dictadoConTransformaciones = funcGralDictado.applyTransformation(
            dictado,
            escalaDiatoica
        );

        track = addNotes(track, dictadoConTransformaciones, figuras, bpm);

        var write = new MidiWriter.Writer(track);
        const nameFileMidi = id.toString();
        const nameFileMp3 = nameFileMidi + '_out';
        write.saveMIDI(`${cte.LOCATION_MUSIC_FILE}${nameFileMidi}`);
        // END generate dictation

        // Reference note
        var trackNoteRef = new MidiWriter.Track();
        // trackNoteRef.addEvent(
        //     new MidiWriter.ProgramChangeEvent({ instrument: 13 })
        // );
        const nota_base_transformada = funcGralDictado.applyTransformation(
            [nota_base],
            escalaDiatoica
        );
        trackNoteRef = addNotes(
            trackNoteRef,
            nota_base_transformada,
            ['1'],
            '128'
        );

        var writeNoteRef = new MidiWriter.Writer(trackNoteRef);
        const nameFileMidiNoteRef = id.toString() + '_note_ref';
        const nameFileMp3NoteRef = nameFileMidiNoteRef + '_out';
        writeNoteRef.saveMIDI(
            `${cte.LOCATION_MUSIC_FILE}${nameFileMidiNoteRef}`
        );
        // END generate dictation

        // if exists -> delete file nameFileMp3.mp3
        const filePathMp3 = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3}.mp3`;
        fs.exists(filePathMp3, (exists) => {
            if (exists) {
                fs.unlinkSync(filePathMp3);
            }
        });

        // if exists -> delete file nameFileMp3NoteRef.mp3
        const filePathMp3NoteRef = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3NoteRef}.mp3`;
        fs.exists(filePathMp3NoteRef, (exists) => {
            if (exists) {
                fs.unlinkSync(filePathMp3NoteRef);
            }
        });

        // convert midi to mp3
        const comand = comands.miditomp3(nameFileMidi, nameFileMp3);
        exec(comand);

        // convert midi to mp3 Note Ref
        const comandNoteRef = comands.miditomp3(
            nameFileMidiNoteRef,
            nameFileMp3NoteRef
        );
        exec(comandNoteRef);

        res.status(200).send({
            ok: true,
            dictadoTransformado: dictadoConTransformaciones,
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
