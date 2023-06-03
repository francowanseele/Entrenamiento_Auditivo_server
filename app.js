const express = require('express');

const app = express();

// Load routings
const soundRoutes = require('./routers/sound');
const dictationRoutes = require('./routers/dictation');
const courseRoutes = require('./routers/course');
const giroMelodicoRoutes = require('./routers/giro_melodico');
const compasRoutes = require('./routers/compas');
const userRoutes = require('./routers/user');
const celulaRitmicaRoutes = require('./routers/celula_ritmica');
const instituteRoutes = require('./routers/institute');
const authRoutes = require('./routers/auth');
const giroMelodicoGrupoRoutes = require('./routers/giro_melodico_grupo');
const CAJRoutes = require('./routers/configuracionAcordesJazz');
const acordesRoutes = require('./routers/acordes');
const configIntervaloRoutes = require('./routers/configuracionIntervalo');
const intervalosRoutes = require('./routers/intervalo');
const calificacionRoutes = require('./routers/calificacion');
const versionCheckRoutes = require('./routers/versionCheck');
const dictadoArmonicoRoutes = require('./routers/dictadoArmonico');
const CDARoutes = require('./routers/configuracionDictadoArmonico');
const MusicSheetRoutes = require('./routers/musicSheet');

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
app.use(`/api`, courseRoutes);
app.use(`/api`, giroMelodicoRoutes);
app.use(`/api`, compasRoutes);
app.use(`/api`, userRoutes);
app.use(`/api`, celulaRitmicaRoutes);
app.use(`/api`, instituteRoutes);
app.use(`/api`, authRoutes);
app.use(`/api`, giroMelodicoGrupoRoutes);
app.use(`/api`, CAJRoutes);
app.use(`/api`, acordesRoutes);
app.use(`/api`, configIntervaloRoutes);
app.use(`/api`, intervalosRoutes);
app.use(`/api`, calificacionRoutes);
app.use(`/api`, versionCheckRoutes);
app.use(`/api`, dictadoArmonicoRoutes);
app.use(`/api`, CDARoutes);
app.use(`/api`, MusicSheetRoutes);

// Export
module.exports = app;
