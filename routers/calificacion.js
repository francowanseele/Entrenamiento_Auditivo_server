const express = require('express');
const calificacionController = require('../controllers/calificacion');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.post('/add-calification', [md_auth.ensureAuth], calificacionController.add);
// api.get('/get-intervalos/:idConfigIntervalo', [md_auth.ensureAuth], intervalosController.getIntervalos)

module.exports = api;
