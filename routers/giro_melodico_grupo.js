const express = require('express');
const GiroMelodicoGrupoController = require('../controllers/giro_melodico_grupo');
const md_auth = require('../middleware/authenticated');
const md_role = require('../middleware/role')

const api = express.Router();

api.post('/add-giro-melodico-grupo', [md_auth.ensureAuth, md_role.isAdmin], GiroMelodicoGrupoController.add);
api.get('/get-all-giros-melodicos-grupo', [md_auth.ensureAuth], GiroMelodicoGrupoController.getAll);
api.put('/edit-giro-melodico-grupo/:id', [md_auth.ensureAuth, md_role.isAdmin], GiroMelodicoGrupoController.edit);
api.delete('/delete-giro-melodico-grupo/:id', [md_auth.ensureAuth, md_role.isAdmin], GiroMelodicoGrupoController.remove);

module.exports = api;
