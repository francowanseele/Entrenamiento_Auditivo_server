const express = require('express');
const GiroMelodicoController = require('../controllers/giro_melodico');
const md_auth = require('../middleware/authenticated');
const md_role = require('../middleware/role')

const api = express.Router();

api.put('/add-giro-melodico', [md_auth.ensureAuth, md_role.isAdmin], GiroMelodicoController.addGiroMelodico);
api.post('/get-giros-melodicos', [md_auth.ensureAuth], GiroMelodicoController.getGiroMelodico);
api.put('/edit-giro-melodico/:id', [md_auth.ensureAuth, md_role.isAdmin], GiroMelodicoController.editGiroMelodico);
api.delete('/delete-giro-melodico/:id', [md_auth.ensureAuth, md_role.isAdmin], GiroMelodicoController.removeGiroMelodico);

module.exports = api;
