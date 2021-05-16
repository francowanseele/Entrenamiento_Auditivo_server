const express = require('express');
const SoundController = require('../controllers/sound');

const api = express.Router();

api.get('/play-sound', SoundController.playSound);
api.get('/transmit-sound', SoundController.transmitirSound);
api.post('/generate-dictation-file/:id', SoundController.generateDictationFile);
api.get('/get-dictation-sound/:id', SoundController.tramsitDictation);

module.exports = api;
