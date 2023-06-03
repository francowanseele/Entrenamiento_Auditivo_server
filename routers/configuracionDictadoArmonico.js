const express = require('express');
const CDAController = require('../controllers/configuracionDictadoArmonico');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.post('/add-configuracion-dictado-armonico', [md_auth.ensureAuth], CDAController.add);
api.get('/get-configuracion-dictado-armonico/:id', [md_auth.ensureAuth], CDAController.get);

module.exports = api;
