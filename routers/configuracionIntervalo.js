const express = require('express');
const ConfIntervaloController = require('../controllers/configuracionIntervalo');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.post('/add-configuracion-intervalo', [md_auth.ensureAuth], ConfIntervaloController.add);
api.get('/get-configuracion-intervalo/:id', [md_auth.ensureAuth], ConfIntervaloController.get);

module.exports = api;
