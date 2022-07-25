const express = require('express');
const UserController = require('../controllers/user');

const api = express.Router();

api.put('/add-user', UserController.addUser);
api.put('/get-user', UserController.obtenerUsuarioRegistrado);
api.post('/add-dictation-user/:id', UserController.generateDictation);
api.get('/get-dictation/:id', UserController.getDictation);
api.post('/set-nuevo-resultado', UserController.agregarNuevoResultado);
api.post('/soft-delete-user/:idUser', UserController.softDeleteUser);

module.exports = api;
