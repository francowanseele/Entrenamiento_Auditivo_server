const express = require('express');
const GiroMelodicoController = require('../controllers/giro_melodico');

const api = express.Router();

api.put('/add-giro-melodico', GiroMelodicoController.addGiroMelodico);

module.exports = api;
