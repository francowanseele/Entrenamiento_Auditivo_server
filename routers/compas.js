const express = require('express');
const CompasController = require('../controllers/compas');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.put('/add-compas', [md_auth.ensureAuth], CompasController.addCompas);
api.get('/get-compas/:simple', [md_auth.ensureAuth], CompasController.getCompas);

module.exports = api;
