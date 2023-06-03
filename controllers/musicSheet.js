const fs = require('fs');
const path = require('path');
const {
    NAME_MUSIC_SHEET_SOLUTION,
    NAME_MUSIC_SHEET_REFERENCE,
    LOCATION_MUSIC_SHEET_FILE,
} = require('../services/constants');
const { getAuthenticationToken } = require('../services/headers');
const { getImageDictadoArmonico } = require('../services/MusicSheet/render');
const { logError } = require('../services/errorService');

/**
 *
 * @param {{ acordes: [string], tonality: string }} req.body ex: { acordes: [ ['D#3','A3'],['F#2','A3'] ], tonality: 'Do' }
 * @param {{ ok: boolean, message: string }} res
 */
function generateMusicSheetSolutionImage(req, res) {
    try {
        const { acordes, tonality } = req.body;
        const id = getAuthenticationToken(req).id;

        const nameFile = id.toString() + NAME_MUSIC_SHEET_SOLUTION;
        getImageDictadoArmonico(acordes, tonality, nameFile);

        res.status(200).send({
            ok: true,
            message: 'Pentagrama generado correctamente.',
        });
    } catch (error) {
        logError('musicSheet/generateMusicSheetSolutionImage', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

/**
 *
 * @param {{ acorde: string, tonality: string }} req.body ex: { acordes: ['D#3','A3'], tonality: 'Do' }
 * @param {{ ok: boolean, message: string }} res
 */
function generateMusicSheetReferenceImage(req, res) {
    try {
        const { acorde, tonality } = req.body;
        const id = getAuthenticationToken(req).id;

        const nameFile = id.toString() + NAME_MUSIC_SHEET_REFERENCE;
        getImageDictadoArmonico([acorde], tonality, nameFile);

        res.status(200).send({
            ok: true,
            message: 'Pentagrama generado correctamente.',
        });
    } catch (error) {
        logError('musicSheet/generateMusicSheetReferenceImage', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

function getMusicSheetSolutionFile(req, res) {
    try {
        const { id } = req.params;

        const filePath = `${LOCATION_MUSIC_SHEET_FILE}${id.toString()}${NAME_MUSIC_SHEET_SOLUTION}.png`;

        fs.open(filePath, 'r', (err, fd) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.error('MUSIC SHEET SOLUTION does not exist');
                    res.status(404).send({
                        ok: false,
                        message: 'El archivo no existe',
                    });
                }

                throw err;
            }

            try {
                res.sendFile(path.resolve(filePath));
            } finally {
                fs.close(fd, (err) => {
                    if (err) throw err;
                });
            }
        });
    } catch (error) {
        logError('musicSheet/getMusicSheetSolutionFile', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

function getMusicSheetReferenceFile(req, res) {
    try {
        const { id } = req.params;

        const filePath = `${LOCATION_MUSIC_SHEET_FILE}${id.toString()}${NAME_MUSIC_SHEET_REFERENCE}.png`;

        fs.open(filePath, 'r', (err, fd) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.error('MUSIC SHEET REFERENCE does not exist');
                    res.status(404).send({
                        ok: false,
                        message: 'El archivo no existe',
                    });
                }

                throw err;
            }

            try {
                res.sendFile(path.resolve(filePath));
            } finally {
                fs.close(fd, (err) => {
                    if (err) throw err;
                });
            }
        });
    } catch (error) {
        logError('musicSheet/getMusicSheetReferenceFile', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    generateMusicSheetSolutionImage,
    generateMusicSheetReferenceImage,
    getMusicSheetSolutionFile,
    getMusicSheetReferenceFile,
};
