const jwt = require('../services/jwt');
const moment = require('moment');
const db = require('../data/knex');
const { logError } = require('../services/errorService');

function willExpireToken(token) {
    const { exp } = jwt.decodedToken(token);
    const currentDate = moment().unix();

    if (currentDate > exp) {
        return true;
    } else {
        return false;
    }
}

async function refreshAccessToken(req, res) {
    try {
        const { refreshToken } = req.body;
        const isTokenExpired = willExpireToken(refreshToken);

        if (isTokenExpired) {
            res.status(404).send({
                ok: false,
                refreshTokenExpired: true,
                message: 'RefreshToken expirado',
            });
        } else {
            const { id } = jwt.decodedToken(refreshToken);

            const users = await db
                .knex('Usuario')
                .where({ id: id })
                .select(
                    'id',
                    'Nombre',
                    'Apellido',
                    'Email',
                    'EsDocente',
                    'CursoPersonalId',
                    'Rol'
                );

            if (users.length == 1) {
                const usr = {
                    id: users[0].id,
                    name: users[0].Nombre,
                    lastname:users[0].Apellido,
                    email:users[0].Email,
                    role:users[0].Rol,
                    isTeacher:users[0].EsDocente,
                    personalCourseId:users[0].CursoPersonalId,
                };

                res.status(200).send({
                    accessToken: jwt.createAccessToken(usr),
                    refreshToken: refreshToken,
                });
            } else {
                res.status(404).send({
                    ok: false,
                    message: 'No se ha encontrado el usuario',
                });
            }
        }
    } catch (error) {
        logError('refreshAccessToken', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    refreshAccessToken,
};
