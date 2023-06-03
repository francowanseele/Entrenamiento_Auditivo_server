const express = require('express');
const MusicSheetController = require('../controllers/musicSheet');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.post('/generate-music-sheet-solution-image', [md_auth.ensureAuth], MusicSheetController.generateMusicSheetSolutionImage);
api.post('/generate-music-sheet-reference-image', [md_auth.ensureAuth], MusicSheetController.generateMusicSheetReferenceImage);
api.get('/get-muic-sheet-solution-file/:id', MusicSheetController.getMusicSheetSolutionFile);
api.get('/get-muic-sheet-reference-file/:id', MusicSheetController.getMusicSheetReferenceFile);

module.exports = api;
