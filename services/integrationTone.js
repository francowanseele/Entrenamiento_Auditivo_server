const { Midi } = require('@tonejs/midi');
const fs = require('fs');
const path = require('path');
const comands = require('./comands');
const { exec } = require('child_process');
const funcGralDictado = require('./funcsGralDictados');

const negraBPM = 80;
const numerador = 4;
const denominador = 4;
const figurasDictado = [
    '2', '2',  '2',  '2',  '2',
    '2', '2',  '8',  '8',  '8',
    '8', '8',  '8',  '8',  '8',
    '2', '8',  '16', '16', '2',
    '8', '16', '16', '2',  '2'
  ];
const notasDictado = [
    'Db4', 'F4',  'Gb4', 'Ab4',
    'C6',  'Ab4', 'F4',  'Eb4',
    'F4',  'Ab4', 'C6',  'Db5',
    'C6',  'Bb5', 'Ab4', 'F4',
    'Db4', 'F4',  'Ab4', 'F4',
    'Db4', 'F4',  'Db4', 'Eb4',
    'Db4'
  ];

// ------------- Functions ----------------
const translateDictadoFigToSec = (figurasDictado, negraSec) => {
    let dictadoSec = figurasDictado.map((fig) => {
        return translateFigToSec(fig, negraSec);
    }); 

    return dictadoSec;
}

const getCompasSec = (numerador, pulsoSec) => {
    return pulsoSec * numerador;
}

const translateFigToSec = (fig, negraSec) => {
    switch (fig.toString()) {
        case '1':
            return negraSec * 4;
        case '2':
            return negraSec * 2;
        case 'd2':
            return negraSec * 2 + negraSec * 1;
        case 'dd2':
            return negraSec * 2 + negraSec * 1 + negraSec / 2;
        case '4':
            return negraSec * 1;
        case 'd4':
            return negraSec * 1 + negraSec / 2;
        case 'dd4':
            return negraSec * 1 + negraSec / 2 + negraSec / 4;
        case '8':
            return negraSec / 2;
        case 'd8':
            return negraSec / 2 + negraSec / 4;
        case 'dd8':
            return negraSec / 2 + negraSec / 4 + negraSec / 8;
        case '16':
            return negraSec / 4;
        case '32':
            return negraSec / 8;
        case '64':
            return negraSec / 16;

        default:
            return null;
    }
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

const trackDictationSound = (figurasDictadoSec, notasDictado, track, timeStart) => {
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
}

// --------------------------------------
// --------------------------------------

// ------------- VAR ----------------
const negraSec = funcGralDictado.bpmToSec(negraBPM);
const pulsoSec = translateFigToSec(denominador, negraSec);
const compasSec = getCompasSec(numerador, pulsoSec);
const dictadoFigurasSec = translateDictadoFigToSec(figurasDictado, negraSec);

// --------------------------------------
// --------------------------------------

// ------------- Prints ----------------
console.log('COMPAS: ' + numerador.toString() + '/' + denominador.toString());
console.log('NEGRA sec');
console.log(negraSec);
console.log('PULSO sec | COMPAS sec');
console.log(pulsoSec);
console.log(compasSec);
console.log('DICTADO FIGURAS SEC');
console.log(dictadoFigurasSec);

// --------------------------------------
// --------------------------------------

// ------------- Generate TRACKS ----------------
var midi = new Midi();
var trackSticks = midi.addTrack();
trackSticks = trackStickSound(trackSticks, numerador, pulsoSec, compasSec);

var trackDictation = midi.addTrack();
trackDictation = trackDictationSound(dictadoFigurasSec, notasDictado, trackDictation, compasSec * 2);

// --------------------------------------
// --------------------------------------

// track.channel = 9;
// // // track.instrument.percussion = true;
// track.instrument.number = 9;
// track.instrument.name = 'drum';

// ------------- Generate FILES ----------------
// write the output
fs.writeFileSync(`../files/dictados/output.mid`, new Buffer(midi.toArray()));

exec(
    `timidity ../files/dictados/output.mid -Ow -o - | ffmpeg -i - -acodec libmp3lame -ab 64k ../files/dictados/output.mp3`
);

// --------------------------------------
// --------------------------------------

console.log('holaa');
