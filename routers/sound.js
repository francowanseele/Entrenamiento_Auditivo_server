const express = require('express');
const SoundController = require('../controllers/sound');

const api = express.Router();

api.get('/play-sound', SoundController.playSound);
api.get('/transmit-sound', SoundController.transmitirSound);

module.exports = api;
