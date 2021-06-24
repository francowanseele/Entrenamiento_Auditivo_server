const express = require('express');
const DictationController = require('../controllers/dictation');

const api = express.Router();

// api.post('/melodic-dictation', DictationController.melodicDictation);
// api.post('/rhythmic-dictation', DictationController.rhythmicDictation);

module.exports = api;
