// const GiroMelodico = require('../models/giro_melodico');
const db = require('../data/knex');
const { logError } = require('../services/errorService');
const formatData = require('../services/formatData');

async function addGiroMelodico(req, res) {
    try {
        // Given 'notas'
        // return object array of type GiroMelodico_Nota to insert
        const getGiroMelodicoNotaToInsert = (notas, gmId) => {
            let objectToInsert = [];
            for (let i = 0; i < notas.length; i++) {
                const nota = notas[i];
                objectToInsert.push({
                    GiroMelodicoId: gmId,
                    Nota: nota,
                    Orden: i,
                });
            }
            return objectToInsert;
        };

        const { giro_melodico, mayor } = req.body;

        const giroMelodicoAdded = await db
            .knex('GiroMelodico')
            .insert({ Mayor: mayor, DelSistema: true })
            .returning(['id']);
        const gmId = giroMelodicoAdded[0].id;

        await db
            .knex('GiroMelodico_Nota')
            .insert(getGiroMelodicoNotaToInsert(giro_melodico, gmId));

        res.status(200).send({
            ok: true,
            message: 'Giro Melódico creada correctamente',
        });
    } catch (error) {
        logError('addGiroMelodico', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getGiroMelodico(req, res) {
    try {
        const { mayor } = req.body;

        const girosMelodicos = await db
            .knex('GiroMelodico')
            .where({
                'GiroMelodico.Mayor': mayor,
                'GiroMelodico.DelSistema': true,
            })
            .select(
                'GiroMelodico.id',
                'GiroMelodico_Nota.Nota',
                'GiroMelodico_Nota.Orden',
                'GiroMelodico.Mayor'
            )
            .join(
                'GiroMelodico_Nota',
                'GiroMelodico_Nota.GiroMelodicoId',
                '=',
                'GiroMelodico.id'
            );

        res.status(200).send({
            ok: true,
            girosMelodicos: formatData.GroupByIdAndShortByOrder(girosMelodicos),
            message: 'Ok',
        });
    } catch (error) {
        logError('getGiroMelodico', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    addGiroMelodico,
    getGiroMelodico,
};
