const voices = {
    tensiones: 0,
    tetrada_triada: 1,
    bajo: 2,
};

const upperVoice = (v) => {
    switch (v) {
        case voices.bajo:
            return voices.tetrada_triada;
        case voices.tetrada_triada:
            return voices.tensiones;
        default:
            return null;
    }
};

const getLowerNote = (v) => {
    switch (v) {
        case voices.tensiones:
            return 'A3';
        case voices.tetrada_triada:
            return 'F3';
        case voices.bajo:
        default:
            return 'D2';
    }
};

const getHigherNote = (v) => {
    switch (v) {
        case voices.bajo:
            return 'E3';
        case voices.tetrada_triada:
            return 'D5';
        case voices.tensiones:
        default:
            return 'A5';
    }
};

module.exports = {
    voices,
    upperVoice,
    getLowerNote,
    getHigherNote,
};
