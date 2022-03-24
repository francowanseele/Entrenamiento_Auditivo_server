const { Midi } = require('@tonejs/midi');
const fs = require('fs');
const path = require('path');
const comands = require('./comands');
const { exec } = require('child_process');

// create a new midi file
var midi = new Midi();
// add a track
const track = midi.addTrack();
track
    .addNote({
        midi: 120,
        time: 0,
        duration: 0.5,
        channel: 9,
    })
    .addNote({
        midi: 60,
        time: 0.5,
        duration: 0.5,
        channel: 1,
    })
    .addNote({
        midi: 120,
        time: 1,
        duration: 0.5,
        channel: 9,
    })
    .addNote({
        midi: 60,
        time: 1.5,
        duration: 0.5,
        channel: 9,
    })
    .addNote({
        name: 'C5',
        time: 2,
        duration: 0.5,
    })
    .addNote({
        name: 'C5',
        time: 2.5,
        duration: 0.5,
    });
// .addNote({
//     name: 'C5',
//     time: 0.3,
//     duration: 0.1,
//     channel: 9,
// })
// .addCC({
//     number: 64,
//     value: 127,
//     time: 2,
// });
track.channel = 9;
// // track.instrument.percussion = true;
track.instrument.number = 9;
// track.instrument.name = 'drum';

// write the output
fs.writeFileSync(`../files/dictados/output.mid`, new Buffer(midi.toArray()));

// const comand = comands.miditomp3('output', 'output');
exec(
    `timidity ../files/dictados/output.mid -Ow -o - | ffmpeg -i - -acodec libmp3lame -ab 64k ../files/dictados/output.mp3`
);

// const comand = comands.miditomp3('output', 'output_mp3');
// exec(comand);

console.log('holaa');
