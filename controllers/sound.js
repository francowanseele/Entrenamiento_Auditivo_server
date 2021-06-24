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

function generateDictationFile(req, res) {
    try {
        const addNotes = (track, dictation, figurasDictado) => {
            // const dictadoTrans = funcGralDictado.translateNotes(dictation);

            for (let i = 0; i < dictation.length; i++) {
                const nota = dictation[i];
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

        const getFigurasALL = (conjuntoFiguras) => {
            var res = [];
            conjuntoFiguras.forEach((figuras) => {
                figuras.forEach((fig) => {
                    res.push(fig);
                });
            });

            return res;
        };

        const { dictado, figurasDictado, escalaDiatoica } = req.body;
        const { id } = req.params;

        var track = new MidiWriter.Track();
        // track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 9 }));
        const figuras = getFigurasALL(figurasDictado);
        const dictadoConTransformaciones = funcGralDictado.applyTransformation(
            dictado,
            escalaDiatoica
        );

        track = addNotes(track, dictadoConTransformaciones, figuras);

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
            dictadoTransformado: dictadoConTransformaciones,
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
    generateDictationFile,
    tramsitDictation,
};
