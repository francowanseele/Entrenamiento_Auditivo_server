const db = require('../data/knex');
const { logError } = require('../services/errorService');
const formatData = require('../services/formatData');
const { getAuthenticationToken } = require('../services/headers');

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

        const { giro_melodico, mayor, grupoId } = req.body;

        const giroMelodicoAdded = await db
            .knex('GiroMelodico')
            .insert({
                Mayor: mayor,
                DelSistema: true,
                GrupoId: grupoId,
                Eliminado: false,
                created_by: getAuthenticationToken(req).id,
            })
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

async function editGiroMelodico(req, res) {
    try {
        const { id } = req.params;
        const { grupoId } = req.body;

        await db
            .knex('GiroMelodico')
            .where({ 'GiroMelodico.id': id })
            .update({
                'GrupoId': grupoId,
                'updated_by': getAuthenticationToken(req).id,
            });

        res.status(200).send({
            ok: true,
            message: 'Giro Melódico editado correctamente',
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
                'GiroMelodico.Eliminado': false,
            })
            .select(
                'GiroMelodico.id',
                'GiroMelodico_Nota.Nota',
                'GiroMelodico_Nota.Orden',
                'GiroMelodico.Mayor',
                'GiroMelodico.GrupoId'
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

async function removeGiroMelodico(req, res) {
    try {
        const { id } = req.params;

        await db
            .knex('GiroMelodico')
            .where({ 'GiroMelodico.id': id })
            .update({
                'Eliminado': true,
                'updated_by': getAuthenticationToken(req).id,
            });

        res.status(200).send({
            ok: true,
            message: 'Giro Melódico eliminado correctamente',
        });
    } catch (error) {
        logError('addGiroMelodico', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}


module.exports = {
    addGiroMelodico,
    getGiroMelodico,
    editGiroMelodico,
    removeGiroMelodico,
};
