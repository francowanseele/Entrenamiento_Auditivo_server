const express = require('express');
const CompasController = require('../controllers/compas');

const api = express.Router();

api.put('/add-compas', CompasController.addCompas);
api.get('/get-compas/:simple', CompasController.getCompas);

module.exports = api;
