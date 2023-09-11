const db = require('../data/knex');
const { logError } = require('../services/errorService');
const { getAuthenticationToken } = require('../services/headers');
const { generarDictadoArmonicoJazz } = require('../services/Armonia/generadorDictadosArmonicosJazz');

async function generateDictadoArmonico(req, res) {
    try {
        const getNotasToSave = (notes) => {
            if (notes.length == 0) return ''

            let res = notes[0];
            for (let i = 1; i < notes.length; i++) {
                const n = notes[i];
                res = res + ',' + n;
            };

            return res;
        }

        const getDictadoArmonicoAcordeToInsert = (chords, dictadoArmonicoId) => {
            let res = []

            for (let i = 0; i < chords.length; i++) {
                const chord = chords[i]
                res.push({
                    Nombre: chord.name,
                    Notas: getNotasToSave(chord.acorde),
                    Tipo: chord.type,
                    Orden: i,
                    DictadoArmonicoId: dictadoArmonicoId,
                })
            }

            return res;
        }
        
        const {
            dataCamposArmonicos,
            dataCamposArmonicosInicio,
            dataCamposArmonicosFin,
            dataCamposArmonicosReferencia,
            escalaDiatonicaRegla,
        } = req.body;
        const { idDA, dictationLength, nroDic, onlyValidation } = req.query;

        if (onlyValidation == 'true') {
            let result = null;
            let i = 0; 
            while (!(result && result.dictation && result.dictation.length == dictationLength) && i < 20) {
                try {
                    result = generarDictadoArmonicoJazz(
                        dataCamposArmonicos,
                        dataCamposArmonicosInicio,
                        dataCamposArmonicosFin,
                        dataCamposArmonicosReferencia,
                        escalaDiatonicaRegla,
                        dictationLength
                    );
                } catch (error) {
                    console.log(error);
                    console.log('TRY CATCH -> ERRORRRRRRR....... generarDictadoArmonicoJazz');
                    result = null
                }
                i++;
            }

            if (result && result.dictation.length == dictationLength) {
                res.status(200).send({
                    ok: true,
                    message: 'Dictado generado correctamente.',
                });
            } else {
                res.status(400).send({
                    ok: false,
                    message: 'No se pudo generar ningún dictado.',
                });
            }
        } else {            
            const cantDictations = parseInt(nroDic);
            let i = 0;
            let generateOk = true;
            let dictationToInsert = [];

            while (i < cantDictations && generateOk) {
                generateOk = false;
                let cantRecMax = 30;
                let cantRec = 0;
                let dictation = null;
                while (!generateOk && cantRec < cantRecMax) {
                    try {
                        dictation = generarDictadoArmonicoJazz(
                            dataCamposArmonicos, 
                            dataCamposArmonicosInicio,
                            dataCamposArmonicosFin,
                            dataCamposArmonicosReferencia,
                            escalaDiatonicaRegla,
                            dictationLength
                        );
                    } catch (error) {
                        console.log('TRY CATCH -> ERRORRRRRRR....... generarDictadoArmonicoJazz');
                        dictation = null
                    }
                    generateOk = dictation && dictation.dictation && dictation.dictation.length && dictation.referenceChord;
                    cantRec++;
                }

                if (!generateOk) {
                    return res.status(400).send({
                        ok: false,
                        message: 'No se pudo generar ningún dictado.',
                    });
                } else {
                    dictationToInsert.push(dictation);
                }

                i++;
            }

            if (!generateOk || dictationToInsert.length == 0) {
                return res.status(400).send({
                    ok: false,
                    message: 'No se pudo generar ningún acorde.',
                });
            } else {
                // Insert dictation dictationToInsert

                let dictadosToReturnSaved = []
                let acordesToReturnSaved = []
                await db.knex.transaction(async (trx) => {
                    for (let i = 0; i < dictationToInsert.length; i++) {
                        const d = dictationToInsert[i];
                        
                        const dictadoArmonicoSaved = await db
                            .knex('DictadoArmonico')
                            .insert({
                                Tonalidad: d.dictation[0].tonality,
                                AcordeReferencia: getNotasToSave(d.referenceChord.acorde),
                                CreadorUsuarioId: getAuthenticationToken(req).id, 
                                ConfiguracionDictadoArmonicoId: idDA,
                            })
                            .returning(['id', 'Tonalidad', 'AcordeReferencia', 'CreadorUsuarioId', 'ConfiguracionDictadoArmonicoId'])
                            .transacting(trx);

                        const dictadoArmonicoId = dictadoArmonicoSaved[0].id

                        const acordesSaved = await db
                            .knex('DictadoArmonico_Acorde')
                            .insert(getDictadoArmonicoAcordeToInsert(d.dictation, dictadoArmonicoId))
                            .returning(['id', 'Nombre', 'Notas', 'Tipo', 'Orden', 'DictadoArmonicoId'])
                            .transacting(trx);

                        dictadosToReturnSaved.push({
                            id: dictadoArmonicoSaved[0].id,
                            Tonalidad: dictadoArmonicoSaved[0].Tonalidad,
                            AcordeReferencia: dictadoArmonicoSaved[0].AcordeReferencia,
                            CreadorUsuarioId: dictadoArmonicoSaved[0].CreadorUsuarioId,
                            ConfiguracionDictadoArmonicoId: dictadoArmonicoSaved[0].ConfiguracionDictadoArmonicoId,
                        });

                        acordesSaved.forEach(a => {
                            acordesToReturnSaved.push({
                                id: a.id,
                                Nombre: a.Nombre,
                                Notas: a.Notas,
                                Tipo: a.Tipo,
                                Orden: a.Orden,
                                DictadoArmonicoId: a.DictadoArmonicoId,
                            })
                        });
                    };
                });

                res.status(200).send({
                    ok: true,
                    dictadosArmonicos: dictadosToReturnSaved,
                    acordes: acordesToReturnSaved,
                    message: 'Dictado generado correctamente.',
                });
            }
        }

    } catch (error) {
        logError('dictadoArmonico/generateDictadoArmonico', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getDictadoArmonico(req, res) {
    try {
        const { idCDA } = req.query;

        const dictadosArmonicos = await db
            .knex('DictadoArmonico')
            .where({
                'DictadoArmonico.ConfiguracionDictadoArmonicoId': idCDA,
                'DictadoArmonico.CreadorUsuarioId': getAuthenticationToken(req).id,
            })
            .select(
                'DictadoArmonico.id',
                'DictadoArmonico.Tonalidad',
                'DictadoArmonico.AcordeReferencia',
            );

        let dictadosArmonicosIds = dictadosArmonicos.map((d) => { return d.id });

        const acordes = await db
            .knex('DictadoArmonico_Acorde')
            .whereIn('DictadoArmonicoId', dictadosArmonicosIds)
            .select(
                'DictadoArmonico_Acorde.id',
                'DictadoArmonico_Acorde.Nombre',
                'DictadoArmonico_Acorde.Notas',
                'DictadoArmonico_Acorde.Tipo',
                'DictadoArmonico_Acorde.DictadoArmonicoId',
                'DictadoArmonico_Acorde.Orden',
            )
            .orderBy('Orden');
        
        const califications = await db
            .knex('Calificacion')
            .whereIn('DictadoArmonicoId', dictadosArmonicosIds)
            .select(
                'id',
                'Nota',
                'Correcto',
                'DictadoArmonicoId',
                'UsuarioId',
                'created_at'
            );

        const dictadosArmonicosResult = dictadosArmonicos.map((d) => {
            return {
                ...d,
                Resuelto: califications.filter((c) => c.DictadoArmonicoId == d.id)
            }
        })

        res.status(200).send({
            ok: true,
            dictadosArmonicos: dictadosArmonicosResult,
            acordes: acordes,
            message: 'Dictados Armónicos obtenidos correctamente.',
        });
    } catch (error) {
        logError('dictadoArmonico/getDictadoArmonico', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    generateDictadoArmonico,
    getDictadoArmonico,
}
