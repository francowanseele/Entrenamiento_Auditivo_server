const dictadoRitmico = require('../services/DictadosRitmicos/generarDictadosRitmicos');
const dictadoMelodico = require('../services/DictadosMelodicos/generarDictadosMelodicos');
const gral = require('../services/funcsGralDictados');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../data/knex');
const {
    GroupByIdAndShortByOrder,
    GetFigurasSeparadasPorLigaduras,
} = require('../services/formatData');
const { roles } = require('../enums/roles');
const { logError } = require('../services/errorService');
const jwt = require('../services/jwt');
const { getAcordeJazz } = require('../services/Armonia/generadorAcordesJazz');
const { RowDescriptionMessage } = require('pg-protocol/dist/messages');
const { getAuthenticationToken } = require('../services/headers');

async function generateAcordeJazz(req, res) {
    try {
        const getAcordesToInsert = (acordes, id, usrId) => {
            const getNotasToSave = (notes) => {
                if (notes.length == 0) return ''

                let res = notes[0];
                for (let i = 1; i < notes.length; i++) {
                    const n = notes[i];
                    res = res + ',' + n;
                };

                return res;
            }

            let res = [];
            acordes.forEach(a => {
                res.push({
                    Nombre: a.name,
                    Notas: getNotasToSave(a.acorde),
                    Tonalidad: a.tonality,
                    Tipo: a.type,
                    NotaReferencia: a.referenceNote,
                    CreadorUsuarioId: usrId,
                    ConfiguracionAcordeJazzId: id,
                })
            });

            return res;
        }
        
        const { dataCamposArmonicos, escalaDiatonicaRegla } = req.body;
        const { idCAJ, cantDictation, onlyValidation } = req.query;

        if (onlyValidation == 'true') {
            let acorde = null;
            let i = 0;
            while (!(acorde && acorde.name && acorde.acorde && acorde.tonality) && i < 20) {
                acorde = getAcordeJazz(dataCamposArmonicos, escalaDiatonicaRegla);
                i++;
            }

            if (acorde && acorde.name && acorde.acorde && acorde.tonality) {
                res.status(200).send({
                    ok: true,
                    message: 'Acorde generado correctamente.',
                });
            } else {
                res.status(400).send({
                    ok: false,
                    message: 'No se pudo generar ningún acorde.',
                });
            }
        } else {
            const nroDic = parseInt(cantDictation);
            let i = 0;
            let generateOk = true;
            let acordesToInsert = [];

            while (i < nroDic && generateOk) {
                generateOk = false;
                let cantRecMax = 30;
                let cantRec = 0;
                let acorde = null;
                while (!generateOk && cantRec < cantRecMax) {
                    acorde = getAcordeJazz(dataCamposArmonicos, escalaDiatonicaRegla);
                    generateOk = acorde && acorde.name && acorde.acorde && acorde.tonality;
                    cantRec++;
                }

                if (!generateOk) {
                    return res.status(400).send({
                        ok: false,
                        message: 'No se pudo generar ningún acorde.',
                    });
                } else {
                    acordesToInsert.push(acorde);
                }

                i++;
            }

            if (!generateOk || acordesToInsert.length == 0) {
                return res.status(400).send({
                    ok: false,
                    message: 'No se pudo generar ningún acorde.',
                });
            } else {
                // Insert acordes acoresToInsert
                const acordesSaved = await db
                    .knex('AcordeJazz')
                    .insert(getAcordesToInsert(acordesToInsert, idCAJ, getAuthenticationToken(req).id))
                    .returning(['id', 'Nombre', 'Notas', 'Tonalidad', 'Tipo', 'NotaReferencia']);

                res.status(200).send({
                    ok: true,
                    acordes: acordesSaved,
                    message: 'Acorde generado correctamente.',
                });
            }
        }

    } catch (error) {
        logError('acordes/generateAcordeJazz', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getAcordesJazz(req, res) {
    try {
        const { idCAJ } = req.query;

        const acordesJazz = await db
            .knex('AcordeJazz')
            .where({
                'AcordeJazz.ConfiguracionAcordeJazzId': idCAJ,
                'AcordeJazz.CreadorUsuarioId': getAuthenticationToken(req).id,
            })
            .select(
                'AcordeJazz.id',
                'AcordeJazz.Nombre',
                'AcordeJazz.Notas',
                'AcordeJazz.Tonalidad',
                'AcordeJazz.Tipo',
                'AcordeJazz.NotaReferencia',
            );

        res.status(200).send({
            ok: true,
            acordesJazz: acordesJazz,
            message: 'Acordes obtenidos correctamente.',
        });
    } catch (error) {
        logError('acordes/getAcordesJazz', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

/**
 * 
 * @param {[{Escala: string, EscalaPrioridad: int, KeyNote: string, KeyNotePrioridad: int, NombreCifrado: string, Tension: string, Tipo: 0 | 1,}]} req.body.dataCamposArmonicos Tension = '' if there is not tension to apply
 * @param {[{elem: string, prioridad: int}]} req.body.escalaDiatonicaRegla
 * @param {string} req.body.name
 * @param {string} req.body.description
 * @param {*} res 
 */
// async function addConfiguracionAcordeJazz(req, res) {
//     try {
//         const { name, description, dataCamposArmonicos, escalaDiatonicaRegla } = req.body;
//         const { idModule } = req.query;

//         await db.knex.transaction(async (trx) => {
//             // Insert ConfiguracionAcordeJazz
//             const caj = await db
//                 .knex('ConfiguracionAcordeJazz')
//                 .insert({
//                     Nombre: name, 
//                     Descripcion: description,
//                     CreadorUsuarioId: getAuthenticationToken(req).id,
//                     ModuloId: idModule,
//                 })
//                 .returning(['id'])
//                 .transacting(trx);
//             const idCAJ = caj[0].id;

//             // Insert ConfiguracionAcordeJazz_CampoArmonico
//             await db
//                 .knex('ConfiguracionAcordeJazz_CampoArmonico')
//                 .insert(dataCamposArmonicos.map((x) => {
//                     return {
//                         Escala: x.Escala,
//                         EscalaPrioridad: x.EscalaPrioridad,
//                         KeyNote: x.KeyNote,
//                         KeyNotePrioridad: x.KeyNotePrioridad,
//                         NombreCifrado: x.NombreCifrado,
//                         Tension: x.Tension,
//                         Tipo: x.Tipo,
//                         ConfiguracionAcordeJazzId: idCAJ,
//                     }
//                 }))
//                 .transacting(trx);

//             // Insert ConfiguracionAcordeJazz_Tonalidad
//             await db
//                 .knex('ConfiguracionDictado_Tonalidad')
//                 .insert(
//                     escalaDiatonicaRegla.map(x => {
//                         return {
//                             Tonalidad: gral.translateTonality(x.elem), 
//                             Prioridad: x.prioridad, 
//                             ConfiguracionAcordeJazzId: idCAJ,
//                         }
//                     })
//                 )
//                 .transacting(trx);
//         })

//         res.status(200).send({
//             ok: true,
//             configAcordeJazz: caj[0],
//             message: 'Ok',
//         });
//     } catch (error) {
//         logError('acordes/addConfiguracionAcordeJazz', error, req);
//         res.status(501).send({
//             ok: false,
//             message: error.message,
//         });
//     }
// }

module.exports = {
    generateAcordeJazz,
    getAcordesJazz,
    // addConfiguracionAcordeJazz,
};