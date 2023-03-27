const express = require('express');
const intervalosController = require('../controllers/intervalo');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.post('/generate-intervalo', [md_auth.ensureAuth], intervalosController.generarIntervalo);
api.get('/get-intervalos/:idConfigIntervalo', [md_auth.ensureAuth], intervalosController.getIntervalos)

module.exports = api;
