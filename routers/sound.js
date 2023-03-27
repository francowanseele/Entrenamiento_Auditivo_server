const express = require('express');
const SoundController = require('../controllers/sound');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.post('/generate-dictation-file/:id', [md_auth.ensureAuth], SoundController.generateDictationFile);
api.post('/generate-acorde-jazz-file', [md_auth.ensureAuth], SoundController.generateAcordeJazzFile);
api.post('/generate-intervalo-file', [md_auth.ensureAuth], SoundController.generateIntervaloFile);
api.get('/get-dictation-sound/:id', SoundController.tramsitDictation);
api.get('/get-note-reference-sound/:id', SoundController.tramsitNoteReference);

module.exports = api;
