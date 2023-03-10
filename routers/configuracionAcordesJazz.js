const express = require('express');
const CAJController = require('../controllers/configuracionAcordesJazz');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.post('/add-configuracion-acorde-jazz', [md_auth.ensureAuth], CAJController.add);
api.get('/get-configuracion-acorde-jazz/:id', [md_auth.ensureAuth], CAJController.get);
// api.put('/edit-giro-melodico-grupo/:id', [md_auth.ensureAuth], GiroMelodicoGrupoController.edit);
// api.delete('/delete-giro-melodico-grupo/:id', [md_auth.ensureAuth], GiroMelodicoGrupoController.remove);

module.exports = api;
