const cte = require('../services/constants');

const fs = require('fs');
const path = require('path');
const MidiWriter = require('midi-writer-js');
const { exec } = require('child_process');
const comands = require('../services/comands');

function playSound(req, res) {
    console.log('play sound.......');

    var track = new MidiWriter.Track();

    // track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 9 }));
    track.setTimeSignature(4, 4);

    // --------------------------------------------------------------------------
    // Prueba puntillo
    track.addEvent(
        [
            new MidiWriter.NoteEvent({
                pitch: ['C4', 'C4'],
                duration: '4',
                velocity: 100,
            }),
            new MidiWriter.NoteEvent({
                pitch: ['C4', 'C4'],
                duration: 'd4',
                velocity: 100,
            }),
        ],
        function (event, index) {
            return { sequential: true };
        }
    );
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
    // track.addEvent(
    //     [
    //         new MidiWriter.NoteEvent({
    //             pitch: ['E4', 'G4'],
    //             duration: '8',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['A4', 'A4'],
    //             duration: '4',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['A4', 'B4'],
    //             duration: '8',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['C5', 'C5'],
    //             duration: '4',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['C5', 'D5'],
    //             duration: '8',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['B4'],
    //             duration: '4',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['B4'],
    //             duration: '4',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['A4', 'G4'],
    //             duration: '8',
    //             velocity: 100,
    //         }),
    //         new MidiWriter.NoteEvent({
    //             pitch: ['G4', 'A4'],
    //             duration: '8',
    //             velocity: 100,
    //         }),
    //     ],
    //     function (event, index) {
    //         return { sequential: true };
    //     }
    // );
    // --------------------------------------------------------------------------

    var write = new MidiWriter.Writer(track);
    // TODO -> newMusic no puede ir hardcodeado,
    // debería incluir el nombre con el identificador del dispositivo de donde se llame
    const nameFileMidi = 'prueba_puntillo';
    const nameFileMp3 = nameFileMidi + '_out';
    write.saveMIDI(`${cte.LOCATION_MUSIC_FILE}${nameFileMidi}`);

    // convert midi to mp3
    const comand = comands.miditomp3(nameFileMidi, nameFileMp3);
    exec(comand);

    res.status(200).send({
        message: 'play sound',
    });
}

function transmitirSound(req, res) {
    // ----------------------------------
    // TODO ...
    // Si existe el archivo nameFileMp3.mp3 borarlo
    // TODO ...
    // Además el nameFileMP3 debería de generarse en un archivo aparte
    // con el identificador del dispositivo + '_out'
    // ----------------------------------

    const nameFileMidi = 'prueba_puntillo';
    const nameFileMp3 = nameFileMidi + '_out';

    console.log('transmite');
    const filePath = `${cte.LOCATION_MUSIC_FILE}${nameFileMp3}.mp3`;

    // const options = {
    //     headers: {
    //       'Cache-Control': false,
    //     }
    //   };

    //   res.sendFile(path.resolve(filePath), options);

    // res.sendFile(path.resolve(filePath));
    fs.exists(filePath, (exists) => {
        if (!exists) {
            res.status(404).send({ message: 'El archivo no existe' });
        } else {
            res.sendFile(path.resolve(filePath));
        }
    });
}

module.exports = {
    playSound,
    transmitirSound,
};
