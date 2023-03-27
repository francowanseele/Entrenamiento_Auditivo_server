const db = require('../data/knex');
const { logError } = require('../services/errorService');
const { getAuthenticationToken } = require('../services/headers');
const { getInterval } = require('../services/Intervalo/generadorIntervalo');

/**
 *
 * @param {dataIntervalos: {
 *          PrioridadClaveSol: int,
 *          PrioridadClaveFa: int,
 *          Direccion: 0 | 1 | 2 (ascendente | descendente | ambas),
 *          Tipo: 0 | 1 | 2 (melodico | armonico | ambos),
 *      },
 *      intervaloRegla: [{
 *          Intervalo: string,
 *          Prioridad: int,
 *      }]} req.body
 * @param {*} res
 * @returns
 */
async function generarIntervalo(req, res) {
    try {
        /**
         *
         * @param {notaReferencia: string, notas: string, clave: string, intervalo: string, direccion: int, tipo: int} intervalos
         * @param {int} id
         * @param {int} usrId
         * @returns
         */
        const getIntervalosToInsert = (intervalos, id, usrId) => {
            let res = [];
            intervalos.forEach((i) => {
                res.push({
                    Notas: i.notas,
                    NotaReferencia: i.notaReferencia,
                    Tipo: i.tipo,
                    Direccion: i.direccion,
                    Clave: i.clave,
                    Intervalo: i.intervalo,
                    CreadorUsuarioId: usrId,
                    ConfiguracionIntervaloId: id,
                });
            });

            return res;
        };

        const { dataIntervalos, intervaloRegla } = req.body;
        const { idConfigIntervalo, cantDictation, onlyValidation } = req.query;

        if (onlyValidation == 'true') {
            let intervaloResult = null;
            let i = 0;
            while (!intervaloResult && i < 20) {
                intervaloResult = getInterval(dataIntervalos, intervaloRegla);
                i++;
            }

            if (intervaloResult) {
                res.status(200).send({
                    ok: true,
                    message: 'Intervalo generado correctamente.',
                });
            } else {
                res.status(400).send({
                    ok: false,
                    message: 'No se pudo generar ningún Intervalo.',
                });
            }
        } else {
            const nroDic = parseInt(cantDictation);
            let i = 0;
            let generateOk = true;
            let intervaloToInsert = [];

            while (i < nroDic && generateOk) {
                generateOk = false;
                let cantRecMax = 30;
                let cantRec = 0;
                let intervaloResult = null;
                while (!generateOk && cantRec < cantRecMax) {
                    intervaloResult = getInterval(
                        dataIntervalos,
                        intervaloRegla
                    );
                    generateOk = intervaloResult && true;
                    cantRec++;
                }

                if (!generateOk) {
                    return res.status(400).send({
                        ok: false,
                        message: 'No se pudo generar ningún Intervalo.',
                    });
                } else {
                    intervaloToInsert.push(intervaloResult);
                }

                i++;
            }

            if (!generateOk || intervaloToInsert.length == 0) {
                return res.status(400).send({
                    ok: false,
                    message: 'No se pudo generar ningún Intervalo.',
                });
            } else {
                // Insert intervalos intervaloToInsert
                const intervalosSaved = await db
                    .knex('Intervalo')
                    .insert(
                        getIntervalosToInsert(
                            intervaloToInsert,
                            idConfigIntervalo,
                            getAuthenticationToken(req).id
                        )
                    )
                    .returning([
                        'Notas',
                        'NotaReferencia',
                        'Tipo',
                        'Direccion',
                        'Clave',
                        'Intervalo',
                        'CreadorUsuarioId',
                        'ConfiguracionIntervaloId',
                        'id',
                    ]);

                res.status(200).send({
                    ok: true,
                    intervalos: intervalosSaved,
                    message: 'Intervalo generado correctamente.',
                });
            }
        }
    } catch (error) {
        logError('intervalo/generarIntervalo', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getIntervalos(req, res) {
    try {
        const { idConfigIntervalo } = req.params;

        const intervalos = await db
            .knex('Intervalo')
            .where({
                'Intervalo.ConfiguracionIntervaloId': idConfigIntervalo,
                'Intervalo.CreadorUsuarioId': getAuthenticationToken(req).id,
            })
            .select(
                'Intervalo.id',
                'Intervalo.Notas',
                'Intervalo.NotaReferencia',
                'Intervalo.Tipo',
                'Intervalo.Direccion',
                'Intervalo.Clave',
                'Intervalo.Intervalo',
                'Intervalo.CreadorUsuarioId',
                'Intervalo.ConfiguracionIntervaloId'
            );

        res.status(200).send({
            ok: true,
            intervalos: intervalos,
            message: 'Intervalos obtenidos correctamente.',
        });
    } catch (error) {
        logError('intervalo/getIntervalos', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    generarIntervalo,
    getIntervalos,
};
