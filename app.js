const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Load routings
const soundRoutes = require('./routers/sound');

// Configuration body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure Header HTTP

// router Basic
app.use(`/api`, soundRoutes);

// Export
module.exports = app;
