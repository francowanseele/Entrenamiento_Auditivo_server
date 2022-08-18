const express = require('express');
const UserController = require('../controllers/user');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.put('/add-user', UserController.addUser);
api.put('/get-user', UserController.obtenerUsuarioRegistrado);
api.post('/add-dictation-user/:id', [md_auth.ensureAuth], UserController.generateDictation);
api.get('/get-dictation/:id', [md_auth.ensureAuth], UserController.getDictation);
api.post('/set-nuevo-resultado', [md_auth.ensureAuth], UserController.agregarNuevoResultado);
api.post('/soft-delete-user/:idUser', [md_auth.ensureAuth], UserController.softDeleteUser);

module.exports = api;
