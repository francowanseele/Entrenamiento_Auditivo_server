const { Interval, Note } = require('@tonaljs/tonal');
const { acordesJazz } = require('./dataAcordesJazz');

const generarAcordesJazz = (encryptedName, keyNote) => {
    const acorde = acordesJazz.find((e) => e.nombreCifrado == encryptedName);

    var result = [keyNote];
    var lastNote = keyNote;
    acorde.semitonos.forEach(s => {
        lastNote = Note.transpose(keyNote, Interval.fromSemitones(s));
        result.push(lastNote);
    });

    return result;
}


console.log(generarAcordesJazz('Maj7', 'C'));
console.log(generarAcordesJazz('7', 'C'));
console.log(generarAcordesJazz('m7', 'C'));
console.log(generarAcordesJazz('m7b5', 'C'));
console.log(generarAcordesJazz('mMaj7', 'C'));
console.log(generarAcordesJazz('AugMaj7', 'C'));
console.log(generarAcordesJazz('07', 'C'));
console.log(generarAcordesJazz('6', 'C'));
console.log(generarAcordesJazz('m6', 'C'));
console.log(generarAcordesJazz('7(#5)', 'C'));
console.log('----------------------');
console.log(generarAcordesJazz('Maj7', 'F'));
console.log(generarAcordesJazz('7', 'F'));
console.log(generarAcordesJazz('m7', 'F'));
console.log(generarAcordesJazz('m7b5', 'F'));
console.log(generarAcordesJazz('mMaj7', 'F'));
console.log(generarAcordesJazz('AugMaj7', 'F'));
console.log(generarAcordesJazz('07', 'F'));
console.log(generarAcordesJazz('6', 'F'));
console.log(generarAcordesJazz('m6', 'F'));
console.log(generarAcordesJazz('7(#5)', 'F'));
