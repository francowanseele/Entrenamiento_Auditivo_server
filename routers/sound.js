const express = require('express');
const SoundController = require('../controllers/sound');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.post('/generate-dictation-file/:id', [md_auth.ensureAuth], SoundController.generateDictationFile);
api.get('/get-dictation-sound/:id', [md_auth.ensureAuth], SoundController.tramsitDictation);
api.get('/get-note-reference-sound/:id', [md_auth.ensureAuth], SoundController.tramsitNoteReference);

module.exports = api;
