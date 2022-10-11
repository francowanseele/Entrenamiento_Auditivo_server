const { Scale, ScaleType } = require("@tonaljs/tonal");
const { ChordType } = require("@tonaljs/tonal");
const { Note, Interval } = require('@tonaljs/tonal');

// console.log(ScaleType.names());
/*
'major pentatonic',
  'ionian pentatonic',
  'mixolydian pentatonic',
  'ritusen',
  'egyptian',
  'neopolitan major pentatonic',
  'vietnamese 1',
  'pelog',
  'kumoijoshi',
  'hirajoshi',
  'iwato',
  'in-sen',
  'lydian pentatonic',
  'malkos raga',
  'locrian pentatonic',
  'minor pentatonic',
  'minor six pentatonic',
  'flat three pentatonic',
  'flat six pentatonic',
  'scriabin',
  'whole tone pentatonic',
  'lydian #5P pentatonic',
  'lydian dominant pentatonic',
  'minor #7M pentatonic',
  'super locrian pentatonic',
  'minor hexatonic',
  'augmented',
  'major blues',
  'piongio',
  'prometheus neopolitan',
  'prometheus',
  'mystery #1',
  'six tone symmetric',
  'whole tone',
  "messiaen's mode #5",
  'minor blues',
  'locrian major',
  'double harmonic lydian',
  'harmonic minor',
  'altered',
  'locrian #2',
  'mixolydian b6',
  'lydian dominant',
  'lydian',
  'lydian augmented',
  'dorian b2',
  'melodic minor',
  'locrian',
  'ultralocrian',
  'locrian 6',
  'augmented heptatonic',
  'dorian #4',
  'lydian diminished',
  'phrygian',
  'leading whole tone',
  'lydian minor',
  'phrygian dominant',
  'balinese',
  'neopolitan major',
  'aeolian',
  'harmonic major',
  'double harmonic major',
  'dorian',
  'hungarian minor',
  'hungarian major',
  'oriental',
  'flamenco',
  'todi raga',
  'mixolydian',
  'persian',
  'major',
  'enigmatic',
  'major augmented',
  'lydian #9',
  "messiaen's mode #4",
  'purvi raga',
  'spanish heptatonic',
  'bebop',
  'bebop minor',
  'bebop major',
  'bebop locrian',
  'minor bebop',
  'diminished',
  'ichikosucho',
  'minor six diminished',
  'half-whole diminished',
  'kafi raga',
  "messiaen's mode #6",
  'composite blues',
  "messiaen's mode #3",
  "messiaen's mode #7",
  'chromatic'
  */

// console.log(ChordType.names());
// console.log(ChordType.get('maj7'));


// console.log(Note.transpose('C2', '2m')); // Db2
// console.log(Interval.distance('C2', 'Db2'));



// console.log(Note.transpose('C2', '4P')); // 
// console.log(Note.transpose('C2', '3m')); // 



// console.log(Interval.distance('D2', 'C2'));
// console.log(Note.transpose('C2', '6m')); // 
// console.log(Note.transpose('C2', '6M')); // 



// console.log('-----');

// console.log(Interval.distance('C2', 'A2'));
// console.log(Interval.distance('C2', 'Ab2'));
// console.log('------');
// console.log(Interval.add(Interval.distance('A#2', 'D2'), '6M'));
// console.log(Interval.add(Interval.distance('A2', 'C2'), '6m'));



// console.log(Interval.distance('A#2', 'A2'));
// console.log(Note.transpose('C2', '1A'));
// console.log(Note.transpose('C2', '-1A'));


// console.log(Interval.add(Interval.distance('A2', 'Cb2'), '6M'));

// console.log(Interval.distance('C2', 'D2'));

console.log(Interval.distance('F3', 'E4'))
console.log(Interval.distance('F3', 'A4'))
console.log(Interval.distance('F3', 'C5'))
console.log(Interval.distance('F2', 'F3'))
