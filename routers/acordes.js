const express = require('express');
const acordesController = require('../controllers/acordes');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.post('/generate-acorde-jazz', [md_auth.ensureAuth], acordesController.generateAcordeJazz);
api.get('/get-acordes-jazz', [md_auth.ensureAuth], acordesController.getAcordesJazz)

module.exports = api;
