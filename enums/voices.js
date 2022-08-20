const voices = {
    soprano: 0,
    contraAlto: 1,
    tenor: 2,
    bajo: 3,
};

const upperVoice = (v) => {
    switch (v) {
        case voice.bajo:
            return voice.tenor;
        case voice.tenor:
            return voice.contraAlto;
        case voice.contraAlto:
            return voice.soprano
        default:
            return null;
    }
}

module.exports = { 
    voices,
    upperVoice
};
