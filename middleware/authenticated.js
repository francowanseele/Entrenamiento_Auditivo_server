const moment = require('moment');
const jwt = require('../services/jwt');
const { logError } = require('../services/errorService');

exports.ensureAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({
            ok: false,
            message: 'La petición no tiene cabecera de autenticación.',
        });
    }

    // Remove url from api in token
    const token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt.decodedToken(token);

        if (payload.exp <= moment.unix()) {
            return res.status(404).send({
                ok: false,
                tokenExpired: true,
                message: 'El token ha expirado.' 
            });
        }
    } catch (ex) {
        logError('ensureAuth', ex, null);
        return res.status(404).send({ 
            ok: false,
            message: 'Token inválido.' 
        });
    }

    req.user = payload;

    // enables to go to the next step
    next();
};
