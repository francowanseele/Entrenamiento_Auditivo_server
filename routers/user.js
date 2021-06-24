const express = require('express');
const UserController = require('../controllers/user');

const api = express.Router();

api.put('/add-user', UserController.addUser);
api.post('/add-dictation-user/:id', UserController.generateDictation);
api.get('/get-dictation/:id', UserController.getDictation);

module.exports = api;
