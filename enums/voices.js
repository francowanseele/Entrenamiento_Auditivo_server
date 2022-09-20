const voices = {
    soprano: 0,
    contraAlto: 1,
    tenor: 2,
    bajo: 3,
};

const upperVoice = (v) => {
    switch (v) {
        case voices.bajo:
            return voices.tenor;
        case voices.tenor:
            return voices.contraAlto;
        case voices.contraAlto:
            return voices.soprano
        default:
            return null;
    }
}

const getVoiceByIndexInArray = (number) => {
    switch (number) {
        case 3:
            return voices.soprano;
        case 2:
            return voices.contraAlto
        case 1:
            return voices.tenor
        case 0:
            return voices.bajo
    
        default:
            return null;
    }
}

const notesInBajo = [
    'E2',
    'E#2',
    'Fb2',
    'F2',
    'F#2',
    'Gb2',
    'G2',
    'G#2',
    'Ab2',
    'A2',
    'A#2',
    'Bb2',
    'B2',
    'B#2',
    'Cb3',
    'C3',
    'C#3',
    'Db3',
    'D3',
    'D#3',
    'Eb3',
    'E3',
    'E#3',
    'Fb3',
    'F3',
    'F#3',
    'Gb3',
    'G3',
    'G#3',
    'Ab3',
    'A3',
    'A#3',
    'Bb3',
    'B3',
    'B#3',
    'Cb4',
    'C4',
    'C#4',
    'Db4',
    'D4',
];

const notesInTenor = [
    'C3',
    'C#3',
    'Db3',
    'D3',
    'D#3',
    'Eb3',
    'E3',
    'E#3',
    'Fb3',
    'F3',
    'F#3',
    'Gb3',
    'G3',
    'G#3',
    'Ab3',
    'A3',
    'A#3',
    'Bb3',
    'B3',
    'B#3',
    'Cb4',
    'C4',
    'C#4',
    'Db4',
    'D4',
    'D#4',
    'Eb4',
    'E4',
    'E#4',
    'Fb4',
    'F4',
    'F#4',
    'Gb4',
    'G4',
];

const notesInContraAlto = [
    'G3',
    'G#3',
    'Ab3',
    'A3',
    'A#3',
    'Bb3',
    'B3',
    'B#3',
    'Cb4',
    'C4',
    'C#4',
    'Db4',
    'D4',
    'D#4',
    'Eb4',
    'E4',
    'E#4',
    'Fb4',
    'F4',
    'F#4',
    'Gb4',
    'G4',
    'G#4',
    'Ab4',
    'A4',
    'A#4',
    'Bb4',
    'B4',
    'B#4',
    'Cb5',
    'C5',
];

const notesInSoprano = [
    'C4',
    'C#4',
    'Db4',
    'D4',
    'D#4',
    'Eb4',
    'E4',
    'E#4',
    'Fb4',
    'F4',
    'F#4',
    'Gb4',
    'G4',
    'G#4',
    'Ab4',
    'A4',
    'A#4',
    'Bb4',
    'B4',
    'B#4',
    'Cb5',
    'C5',
    'C#5',
    'Db5',
    'D5',
    'D#5',
    'Eb5',
    'E5',
    'E#5',
    'Fb5',
    'F5',
    'F#5',
    'Gb5',
    'G5',
];

module.exports = { 
    voices,
    upperVoice,
    getVoiceByIndexInArray,
    notesInBajo,
    notesInTenor,
    notesInContraAlto,
    notesInSoprano,
};
