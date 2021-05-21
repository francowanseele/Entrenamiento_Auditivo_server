const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Load routings
const soundRoutes = require('./routers/sound');
const dictationRoutes = require('./routers/dictation');
const studentRoutes = require('./routers/student');

// Configuration body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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
app.use(`/api`, studentRoutes);

// Export
module.exports = app;
