const express = require('express');
const dictadoArmonicoController = require('../controllers/dictadoArmonico');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.post('/generate-dictado-armonico', [md_auth.ensureAuth], dictadoArmonicoController.generateDictadoArmonico);
api.get('/get-dictado-armonico', [md_auth.ensureAuth], dictadoArmonicoController.getDictadoArmonico)

module.exports = api;
