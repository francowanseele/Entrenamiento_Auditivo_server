const jwt = require('../services/jwt');
const { logError } = require('../services/errorService');
const { roles } = require('../enums/roles');

const isAdmin = (req, res, next) => {
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

        if (payload.role != roles.admin) {
            return res.status(501).send({ 
                ok: false,
                message: 'Usuario no tiene permisos admin.' 
            });
        }
    } catch (ex) {
        logError('isAdmin', ex, null);
        return res.status(404).send({ 
            ok: false,
            message: 'Token inválido.' 
        });
    }

    // enables to go to the next step
    next();
}

module.exports = {
    isAdmin,
};
