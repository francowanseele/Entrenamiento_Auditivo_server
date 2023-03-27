// const db = require('../data/knex');
// const { tipoConfiguracion } = require('../enums/tipoConfiguracion');
// const { logError } = require('../services/errorService');
// const { getAuthenticationToken } = require('../services/headers');

// async function add(req, res) {
//     try {
//         const { note, correct, typeConfig } = req.body;
//         const { idExercise } = req.query;

//         if (typeConfig == tipoConfiguracion.ConfiguracionDictado) {
//             const configDictation = await db
//                 .knex('Dictado')
//                 .where({ 'Dictado.id': idExercise })
//                 .select('id', ...)
//         } else if (typeConfig == tipoConfiguracion.ConfiguracionAcordeJazz) {

//         } else if (typeConfig == tipoConfiguracion.ConfiguracionIntervalo) {

//         } else {
//             res.status(400).send({
//                 ok: false,
//                 message: 'Tipo de ejercicio incorrecto.',
//             });
//         }

//         await db.knex.transaction(async (trx) => {
//             const configIntervaloAdded = await db
//                 .knex('ConfiguracionIntervalo')
//                 .insert({
//                     Nombre: name,
//                     Descripcion: description,
//                     CreadorUsuarioId: getAuthenticationToken(req).id,
//                     ModuloId: idModule,
//                     PrioridadClaveSol: dataIntervalos.PrioridadClaveSol,
//                     PrioridadClaveFa: dataIntervalos.PrioridadClaveFa,
//                     Direccion: dataIntervalos.Direccion,
//                     Tipo: dataIntervalos.Tipo,
//                 })
//                 .returning(['id'])
//                 .transacting(trx);

//             const idConfigIntervaloAdded = configIntervaloAdded[0].id;

//             await db
//                 .knex('ConfiguracionIntervalo_Intervalo')
//                 .insert(
//                     getIntervaloToInsert(intervaloRegla, idConfigIntervaloAdded)
//                 )
//                 .transacting(trx);
//         });

//         res.status(200).send({
//             ok: true,
//             message: 'Configuracion Intervalo creada correctamente.',
//         });
//     } catch (error) {
//         logError('calificacion/add', error, req);
//         res.status(501).send({
//             ok: false,
//             message: error.message,
//         });
//     }
// }
