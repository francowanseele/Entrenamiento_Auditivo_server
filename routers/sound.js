const express = require('express');
const SoundController = require('../controllers/sound');

const api = express.Router();

api.post('/play-sound', SoundController.playSound);

module.exports = api;
