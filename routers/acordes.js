const express = require('express');
const acordesController = require('../controllers/acordes');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.post('/generate-acorde-jazz', [md_auth.ensureAuth], acordesController.generateAcordeJazz);
api.get('/get-acordes-jazz', [md_auth.ensureAuth], acordesController.getAcordesJazz)
// api.post('/add-configuracion-acorde-jazz', [md_auth.ensureAuth], acordesController.addConfiguracionAcordeJazz);
// api.get('/get-all-giros-melodicos-grupo', [md_auth.ensureAuth], GiroMelodicoGrupoController.getAll);
// api.put('/edit-giro-melodico-grupo/:id', [md_auth.ensureAuth], GiroMelodicoGrupoController.edit);
// api.delete('/delete-giro-melodico-grupo/:id', [md_auth.ensureAuth], GiroMelodicoGrupoController.remove);

module.exports = api;
