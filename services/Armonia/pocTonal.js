const { Scale, ScaleType } = require("@tonaljs/tonal");
const { ChordType } = require("@tonaljs/tonal");
const { Note, Interval } = require('@tonaljs/tonal');
const { getNotaTransformada } = require("../DictadosMelodicos/transformarEscala");
const { transformarAEscalaDiatonica } = require("../EscalasDiatonicas/moduleAngloSaxonNomenclature");
const { calcularDiatonicaMayorMenor } = require("../EscalasDiatonicas/validacion");
const { translateNotes } = require("../funcsGralDictados");
const { generarTetradaJazz } = require("./generadorAcordesJazz");
// const { fixDistances } = require("./generadorAcordesJazz");

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

// console.log(Interval.distance('F3', 'E4'))
// console.log(Interval.distance('F3', 'A4'))
// console.log(Interval.distance('F3', 'C5'))
// console.log(Interval.distance('F2', 'F3'))


// console.log(Interval.semitones('5P'));
// console.log(Interval.get('3m'));
// console.log(Interval.get('9m'));


// console.log(Note.transpose('C', '9m'));
// console.log(Note.transpose('C', '9M'));
// console.log(Note.transpose('C', '11P'));
// console.log(Note.transpose('C', '11A'));
// console.log(Note.transpose('C', '13m'));
// console.log(Note.transpose('C', '13M'));




// console.log(Note.chroma('C#'))
// console.log(Note.chroma('C#4'))

// console.log(Note.transpose('G#2', '2m')); // Db2
// console.log(Note.transpose('G#3', '2m')); // Db2
// console.log(Note.transpose('D#4', '2m')); // Db2
// console.log(Note.transpose('E4', '2m')); // Db2
// console.log(Note.transpose('B4', '2m')); // Db2
// console.log(Note.transpose('E4', '3M')); // Fb2
// console.log(Note.transpose('C2', '4P')); // Fb2


// console.log(Note.transpose('E3', '2m')); 
// console.log(Note.transpose('G#3', '2m')); 
// console.log(Note.transpose('D4', '2m')); 

// console.log('----');

// console.log(Note.transpose('A3', '2m')); 
// console.log(Note.transpose('A4', '2m')); 



// C#4 C##4 E4 
// console.log(Interval.distance('C#4', 'C##4'))
// console.log(Interval.distance('C##4', 'E4'))
// console.log(Interval.distance('F#4', 'A4'))
// console.log(Interval.distance('D3', 'F#4'))
// console.log(Interval.distance('C4', 'E4'))
// console.log(Interval.distance('E4', 'G4'))
// console.log(Interval.distance('G4', 'Gb5'))
// console.log(Interval.distance('Gb5', 'G#5'))

// fixDistances (['D3', 'F#3', 'A3', 'C4', 'E5', 'G5'], i, [], ['D', 'F#', 'A', 'C'])


// console.log(Note.pitchClass('G##5'));


// console.log(transformarAEscalaDiatonica(['Do4', 'Re4', 'Mi4'], 'Re'))


// nroInvolucrados
// console.log(Interval.get(Interval.distance('B4', 'G3')));
// console.log(Interval.get(Interval.distance('G3', 'B4')));
// console.log(Interval.get(Interval.distance('G', 'G')));


// const { acc, letter, oct } = Note.get('C#')

// console.log(letter + ' ' + acc + ' ' + oct);

console.log(Note.get('C#'));
// console.log(Note.get('C2'));
// console.log(Note.get('C#'));
// console.log(Note.get('C#4'));
// console.log(Note.get('C##2'));


// console.log(calcularDiatonicaMayorMenor('Fa#', 'M'));


// console.log(transformarAEscalaDiatonica(['D'], 'F#'));
// console.log(generarTetradaJazz('6sus2', 'G#'));

// console.log(translateNotes(['Do']));


// console.log(Interval.distance('E3', 'A3'));
// console.log(Interval.distance('A3', 'D#4'));
// console.log('---------------------');

// console.log(Interval.distance('G3', 'D6'));
// console.log(Interval.distance('B1', 'F4'));

// console.log(Note.transpose('A4', '-8P'));
// console.log(Note.transpose('C4', '4A'));
// console.log(Note.transpose('E', '5P')); // B


// console.log(Interval.names());

// console.log(Note.transpose('F2', '8P'));
// console.log(Note.transpose('F2', '-8P'));
// console.log('-----');
// console.log(Note.transpose('F5', '6M'));
// console.log(Note.transpose('F5', '-6M'));


// console.log(Interval.add(Interval.distance('A3', 'A2'), '8P')); // != -


// console.log(Interval.distance('A4', 'G#5'))
// console.log(Interval.distance('C5', 'B3'))
