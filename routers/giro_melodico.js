const express = require('express');
const GiroMelodicoController = require('../controllers/giro_melodico');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.put('/add-giro-melodico', [md_auth.ensureAuth], GiroMelodicoController.addGiroMelodico);
api.post('/get-giros-melodicos', [md_auth.ensureAuth], GiroMelodicoController.getGiroMelodico);

module.exports = api;
