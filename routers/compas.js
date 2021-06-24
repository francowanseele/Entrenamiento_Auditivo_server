const express = require('express');
const CompasController = require('../controllers/compas');

const api = express.Router();

api.put('/add-compas', CompasController.addCompas);

module.exports = api;
