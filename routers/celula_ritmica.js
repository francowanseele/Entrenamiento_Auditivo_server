const express = require('express');
const CelulaRitmicaController = require('../controllers/celula_ritmica');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

// api.put('/add-celula-ritmica', [md_auth.ensureAuth], CelulaRitmicaController.addCelulaRitmica);
api.get(
    '/get-celula-ritmica/:simple',
    [md_auth.ensureAuth],
    CelulaRitmicaController.getCelulaRitmica
);
api.post('/create-celula-ritmica', [md_auth.ensureAuth], CelulaRitmicaController.CreateCelulaRitmica);

api.post('/delete-celula-ritmica', [md_auth.ensureAuth], CelulaRitmicaController.DeleteCelulaRitmica);

module.exports = api;
