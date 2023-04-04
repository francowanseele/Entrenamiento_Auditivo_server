const cte = require('../services/constants');

// Archivo para generar los comandos a ejecutar en consola
function miditomp3(nameFile_input, nameFile_output) {
    // timidity + ffmpeg
    // const cmd = `timidity ${cte.LOCATION_MUSIC_FILE}${nameFile_input}.mid -Ow -o - | ffmpeg -i - -acodec libmp3lame -ab 64k ${cte.LOCATION_MUSIC_FILE}${nameFile_output}.mp3`;

    // fluidshynth + ffmpeg
    const cmd = `fluidsynth -a alsa -T raw -F - /usr/share/sounds/sf2/FluidR3_GM.sf2 ${cte.LOCATION_MUSIC_FILE}${nameFile_input}.mid | ffmpeg -f s32le -i - ${cte.LOCATION_MUSIC_FILE}${nameFile_output}.mp3`

    return cmd;
}

module.exports = {
    miditomp3,
};
