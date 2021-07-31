const express = require('express');
const CelulaRitmicaController = require('../controllers/celula_ritmica');

const api = express.Router();

api.put('/add-celula-ritmica', CelulaRitmicaController.addCelulaRitmica);
api.get(
    '/get-celula-ritmica/:simple',
    CelulaRitmicaController.getCelulaRitmica
);

module.exports = api;