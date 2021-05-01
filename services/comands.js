const cte = require('../services/constants');

// Archivo para generar los comandos a ejecutar en consola
function miditomp3(nameFile_input, nameFile_output) {
    const cmd = `timidity ${cte.LOCATION_MUSIC_FILE}${nameFile_input}.mid -Ow -o - | ffmpeg -i - -acodec libmp3lame -ab 64k ${cte.LOCATION_MUSIC_FILE}${nameFile_output}.mp3`;

    return cmd;
}

module.exports = {
    miditomp3,
};
