const express = require('express');
const SoundController = require('../controllers/sound');

const api = express.Router();

api.post('/generate-dictation-file/:id', SoundController.generateDictationFile);
api.get('/get-dictation-sound/:id', SoundController.tramsitDictation);
api.get('/get-note-reference-sound/:id', SoundController.tramsitNoteReference);

module.exports = api;
