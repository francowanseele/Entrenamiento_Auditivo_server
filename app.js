const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Load routings
const soundRoutes = require('./routers/sound');
const dictationRoutes = require('./routers/dictation');

// Configuration body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure Header HTTP
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method'
    );
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, DELETE'
    );
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// router Basic
app.use(`/api`, soundRoutes);
app.use(`/api`, dictationRoutes);

// Export
module.exports = app;
