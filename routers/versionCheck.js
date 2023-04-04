const express = require('express');
const versionCheckController = require('../controllers/versionCheck');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.get('/get-need-version-update', [md_auth.ensureAuth], versionCheckController.needUpdate);

module.exports = api;
