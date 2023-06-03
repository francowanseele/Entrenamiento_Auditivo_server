const db = require('../data/knex');
const { tipoConfiguracion } = require('../enums/tipoConfiguracion');
const { logError } = require('../services/errorService');
const { getAuthenticationToken } = require('../services/headers');

async function add(req, res) {
    try {
        const { note, correct, typeConfig } = req.body;
        const { idExercise } = req.query;

        const usrId = getAuthenticationToken(req).id;

        if (typeConfig == tipoConfiguracion.ConfiguracionDictado) {
            const configs = await db
                .knex('Dictado')
                .where({ 'Dictado.id': idExercise })
                .select(
                    'Dictado.id as DictadoId', 
                    'Dictado.CreadorUsuarioId as UsuarioId', 
                    'ConfiguracionDictado.id as ConfiguracionDictadoId',
                    'Modulo.id as ModuloId',
                    'Modulo.CursoId as CursoId',
                )
                .join(
                    'ConfiguracionDictado',
                    'ConfiguracionDictado.id',
                    '=',
                    'Dictado.ConfiguracionDictadoId'
                )
                .join(
                    'Modulo',
                    'Modulo.id',
                    '=',
                    'ConfiguracionDictado.ModuloId'
                );
            const config = configs[0];

            if (config.UsuarioId == usrId) {
                await db
                    .knex('Calificacion')
                    .insert({
                        Nota: note,
                        Correcto: correct,
                        UsuarioId: usrId,
                        DictadoId: config.DictadoId,
                        AcordeJazzid: null,
                        IntervaloId: null,
                        ModuloId: config.ModuloId,
                        CursoId: config.CursoId,
                    });

                res.status(200).send({
                    ok: true,
                    message: 'Calificacion guardada correctamente.',
                });
            } else {
                res.status(400).send({
                    ok: false,
                    message: 'El usuario no tiene permisos de calificar este ejercicio.',
                });
            }
        } else if (typeConfig == tipoConfiguracion.ConfiguracionAcordeJazz) {
            const configs = await db
                .knex('AcordeJazz')
                .where({ 'AcordeJazz.id': idExercise })
                .select(
                    'AcordeJazz.id as AcordeJazzId', 
                    'AcordeJazz.CreadorUsuarioId as UsuarioId', 
                    'ConfiguracionAcordeJazz.id as ConfiguracionAcordeJazzId',
                    'Modulo.id as ModuloId',
                    'Modulo.CursoId as CursoId',
                )
                .join(
                    'ConfiguracionAcordeJazz',
                    'ConfiguracionAcordeJazz.id',
                    '=',
                    'AcordeJazz.ConfiguracionAcordeJazzId'
                )
                .join(
                    'Modulo',
                    'Modulo.id',
                    '=',
                    'ConfiguracionAcordeJazz.ModuloId'
                );
            const config = configs[0];

            if (config.UsuarioId == usrId) {
                await db
                    .knex('Calificacion')
                    .insert({
                        Nota: note,
                        Correcto: correct,
                        UsuarioId: usrId,
                        DictadoId: null,
                        AcordeJazzid: config.AcordeJazzId,
                        IntervaloId: null,
                        ModuloId: config.ModuloId,
                        CursoId: config.CursoId,
                    });

                res.status(200).send({
                    ok: true,
                    message: 'Calificacion guardada correctamente.',
                });
            } else {
                res.status(400).send({
                    ok: false,
                    message: 'El usuario no tiene permisos de calificar este ejercicio.',
                });
            }
        } else if (typeConfig == tipoConfiguracion.ConfiguracionIntervalo) {
            const configs = await db
                .knex('Intervalo')
                .where({ 'Intervalo.id': idExercise })
                .select(
                    'Intervalo.id as IntervaloId', 
                    'Intervalo.CreadorUsuarioId as UsuarioId', 
                    'ConfiguracionIntervalo.id as ConfiguracionIntervaloId',
                    'Modulo.id as ModuloId',
                    'Modulo.CursoId as CursoId',
                )
                .join(
                    'ConfiguracionIntervalo',
                    'ConfiguracionIntervalo.id',
                    '=',
                    'Intervalo.ConfiguracionIntervaloId'
                )
                .join(
                    'Modulo',
                    'Modulo.id',
                    '=',
                    'ConfiguracionIntervalo.ModuloId'
                );
            const config = configs[0];

            if (config.UsuarioId == usrId) {
                await db
                    .knex('Calificacion')
                    .insert({
                        Nota: note,
                        Correcto: correct,
                        UsuarioId: usrId,
                        DictadoId: null,
                        AcordeJazzid: null,
                        IntervaloId: config.IntervaloId,
                        ModuloId: config.ModuloId,
                        CursoId: config.CursoId,
                    });

                res.status(200).send({
                    ok: true,
                    message: 'Calificacion guardada correctamente.',
                });
            } else {
                res.status(400).send({
                    ok: false,
                    message: 'El usuario no tiene permisos de calificar este ejercicio.',
                });
            }
        } if (typeConfig == tipoConfiguracion.ConfiguracionDictadoArmonico) {
            const configs = await db
                .knex('DictadoArmonico')
                .where({ 'DictadoArmonico.id': idExercise })
                .select(
                    'DictadoArmonico.id as DictadoArmonicoId', 
                    'DictadoArmonico.CreadorUsuarioId as UsuarioId',

                    'ConfiguracionDictadoArmonico.id as ConfiguracionDictadoArmonicoId',
                    'Modulo.id as ModuloId',
                    'Modulo.CursoId as CursoId',
                )
                .join(
                    'ConfiguracionDictadoArmonico',
                    'ConfiguracionDictadoArmonico.id',
                    '=',
                    'DictadoArmonico.ConfiguracionDictadoArmonicoId'
                )
                .join(
                    'Modulo',
                    'Modulo.id',
                    '=',
                    'ConfiguracionDictadoArmonico.ModuloId'
                );
            const config = configs[0];

            if (config.UsuarioId == usrId) {
                await db
                    .knex('Calificacion')
                    .insert({
                        Nota: note,
                        Correcto: correct,
                        UsuarioId: usrId,
                        DictadoId: null,
                        AcordeJazzid: null,
                        DictadoArmonicoId: config.DictadoArmonicoId,
                        IntervaloId: null,
                        ModuloId: config.ModuloId,
                        CursoId: config.CursoId,
                    });

                res.status(200).send({
                    ok: true,
                    message: 'Calificacion guardada correctamente.',
                });
            } else {
                res.status(400).send({
                    ok: false,
                    message: 'El usuario no tiene permisos de calificar este ejercicio.',
                });
            }
        } else {
            res.status(400).send({
                ok: false,
                message: 'Tipo de ejercicio incorrecto.',
            });
        }
    } catch (error) {
        logError('calificacion/add', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    add,
};
