const acordesJazz = [
    {
        nombreCifrado: 'Maj7',
        semitonos: ['4', '7', '11'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5P', '7M'],
    },
    {
        nombreCifrado: '7',
        semitonos: ['4', '7', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5P', '7m'],
    },
    {
        nombreCifrado: 'm7',
        semitonos: ['3', '7', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3m', '5P', '7m'],
    },
    {
        nombreCifrado: 'm7b5',
        semitonos: ['3', '6', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3m', '5d', '7m'],
    },
    {
        nombreCifrado: 'mMaj7',
        semitonos: ['3', '7', '11'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3m', '5P', '7M'],
    },
    {
        nombreCifrado: 'AugMaj7', // <<<---
        semitonos: ['4', '8', '11'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5A', '7M'],
    },
    {
        nombreCifrado: '07', // <<<---
        semitonos: ['3', '6', '9'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3m', '5d', '7d'],
    },
    {
        nombreCifrado: '6',
        semitonos: ['4', '7', '9'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5P', '6M'],
    },
    {
        nombreCifrado: 'm6',
        semitonos: ['3', '7', '9'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3m', '5P', '6M'],
    },
    {
        nombreCifrado: '7(#5)', // <<<---
        semitonos: ['4', '8', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5A', '7m'],
    },
    {
        nombreCifrado: '7(b5)',
        semitonos: ['4', '6', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['3M', '5d', '7m'],
    },
    {
        nombreCifrado: '7sus2',
        semitonos: ['2', '7', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['2M', '5P', '7m'],
    },
    {
        nombreCifrado: '7sus4',
        semitonos: ['5', '7', '10'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['4P', '5P', '7m'],
    },
    {
        nombreCifrado: '6sus2',
        semitonos: ['2', '7', '9'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['2M', '5P', '6M'],
    },
    {
        nombreCifrado: '6sus4',
        semitonos: ['5', '7', '9'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['4P', '5P', '6M'],
    },
    {
        nombreCifrado: 'maj7sus2',
        semitonos: ['2', '7', '11'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['2M', '5P', '7M'],
    },
    {
        nombreCifrado: 'maj7sus4',
        semitonos: ['5', '7', '11'], // Interval.fromSemitones(semitone) -> return interval
        intervalos: ['4P', '5P', '7M'],
    },
];

module.exports = {
    acordesJazz,
};
