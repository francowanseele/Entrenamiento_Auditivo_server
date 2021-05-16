const fs = require('fs');
const path = require('path');
const MidiWriter = require('midi-writer-js');
const { exec } = require('child_process');

const cte = require('../services/constants');
const comands = require('../services/comands');
const funcGralDictado = require('../services/funcsGralDictados');

// Viejo
function playSound(req, res) {
    console.log('play sound.......');

    var track = new MidiWriter.Track();

    // track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 9 }));
    track.setTimeSignature(4, 4);

    // --------------------------------------------------------------------------
    // silencios
    // track.addEvent(
    //     [
    //         new MidiWriter.NoteEvent({
    //             pitch: ['C4', 'C4'],
    //             duration: '4',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['wait', 'wait'],
    //             duration: '4',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['C4', 'C4'],
    //             duration: '4',
    //             velocity: 100,
    //         }),
    //     ],
    //     function (event, index) {
    //         return { sequential: true };
    //     }
    // );
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    // Prueba puntillo
    // track.addEvent(
    //     [
    //         new MidiWriter.NoteEvent({
    //             pitch: ['C4', 'C4'],
    //             duration: '4',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['C4', 'C4'],
    //             duration: 'd4',
    //             velocity: 100,
    //         }),
    //     ],
    //     function (event, index) {
    //         return { sequential: true };
    //     }
    // );
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    // Prueba con Do doble sostenido
    // track.addEvent(
    //     [
    //         new MidiWriter.NoteEvent({
    //             pitch: ['C4', 'C4', 'C#4', 'C#4', 'C##4', 'C##4'],
    //             duration: '4',
    //             velocity: 100,
    //         }),
    //     ],
    //     function (event, index) {
    //         return { sequential: true };
    //     }
    // );
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    // GOT
    // track.addEvent(
    //     [
    //         new MidiWriter.NoteEvent({
    //             pitch: ['G4', 'C4'],
    //             duration: '4',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['Eb4', 'F4'],
    //             duration: '8',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['G4', 'C4'],
    //             duration: '4',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['Eb4', 'F4'],
    //             duration: '8',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['G4', 'C4'],
    //             duration: '4',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['Eb4', 'F4'],
    //             duration: '8',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['G4', 'C4'],
    //             duration: '4',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['Eb4', 'F4'],
    //             duration: '8',
    //             velocity: 100,
    //         }),
    //     ],
    //     function (event, index) {
    //         return { sequential: true };
    //     }
    // );
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    // Piratas del caribe
    track.addEvent(
        [
            new MidiWriter.NoteEvent({
                pitch: ['E4', 'G4'],
                duration: '8',
                velocity: 100,
            }),
            new MidiWriter.NoteEvent({
                pitch: ['A4', 'A4'],
                duration: '4',
                velocity: 100,
            }),
            new MidiWriter.NoteEvent({
                pitch: ['A4', 'B4'],
                duration: '8',
                velocity: 100,
            }),
            new MidiWriter.NoteEvent({
                pitch: ['C5', 'C5'],
                duration: '4',
                velocity: 100,
            }),
            new MidiWriter.NoteEvent({
                pitch: ['C5', 'D5'],
                duration: '8',
                velocity: 100,
            }),
            new MidiWriter.NoteEvent({
                pitch: ['B4'],
                duration: '4',
                velocity: 100,
            }),
            new MidiWriter.NoteEvent({
                pitch: ['B4'],
                duration: '4',
                velocity: 100,
            }),
            new MidiWriter.NoteEvent({
                pitch: ['A4', 'G4'],
                duration: '8',
                velocity: 100,
            }),
            new MidiWriter.NoteEvent({
                pitch: ['G4', 'A4'],
                duration: '8',
                velocity: 100,
            }),
        ],
        function (event, index) {
            return { sequential: true };
        }
    );
    // --------------------------------------------------------------------------

    var write = new MidiWriter.Writer(track);
    // TODO -> newMusic no puede ir hardcodeado,
    // debería incluir el nombre con el identificador del dispositivo de donde se llame
    const nameFileMidi = 'silencios';
    const nameFileMp3 = nameFileMidi + '_out';
    write.saveMIDI(`${cte.LOCATION_MUSIC_FILE}${nameFileMidi}`);

    // convert midi to mp3
    const comand = comands.miditomp3(nameFileMidi, nameFileMp3);
    exec(comand);

    res.status(200).send({
        message: 'play sound',
    });
}

// Viejo
function transmitirSound(req, res) {
    // ----------------------------------
    // TODO ...
    // Si existe el archivo nameFileMp3.mp3 borarlo
    // TODO ...
    // Además el nameFileMP3 debería de generarse en un archivo aparte
    // con el identificador del dispositivo + '_out'
    // ----------------------------------

    const nameFileMidi = 'silencios';
    const nameFileMp3 = nameFileMidi + '_out';

    console.log('transmite');
    const filePath = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3}.mp3`;

    fs.exists(filePath, (exists) => {
        if (!exists) {
            res.status(404).send({ message: 'El archivo no existe' });
        } else {
            res.sendFile(path.resolve(filePath));
        }
    });
}

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

function generateDictationFile(req, res) {
    try {
        const addNotes = (track, dictation, figurasDictado) => {
            const dictadoTrans = funcGralDictado.translateNotes(dictation);

            for (let i = 0; i < dictadoTrans.length; i++) {
                const nota = dictadoTrans[i];
                const fig = figurasDictado[i];

                track.addEvent(
                    [
                        new MidiWriter.NoteEvent({
                            pitch: [nota],
                            duration: fig,
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

        const { dictado, figurasDictado } = req.body;
        const { id } = req.params;

        var track = new MidiWriter.Track();
        // track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 9 }));
        track = addNotes(track, dictado, figurasDictado);

        var write = new MidiWriter.Writer(track);
        const nameFileMidi = id.toString();
        const nameFileMp3 = nameFileMidi + '_out';
        write.saveMIDI(`${cte.LOCATION_MUSIC_FILE}${nameFileMidi}`);

        // if exists -> delete file nameFileMp3.mp3
        const filePathMp3 = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3}.mp3`;
        fs.exists(filePathMp3, (exists) => {
            if (exists) {
                fs.unlinkSync(filePathMp3);
            }
        });

        // convert midi to mp3
        const comand = comands.miditomp3(nameFileMidi, nameFileMp3);
        exec(comand);

        res.status(200).send({
            ok: true,
            message:
                'Generación correcta de los dictados en archivos .mid y .mp3.',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    playSound,
    transmitirSound,
    generateDictationFile,
    tramsitDictation,
};
