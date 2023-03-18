const db = require('../data/knex');
const { logError } = require('../services/errorService');
const { getAuthenticationToken } = require('../services/headers');

/**
 *
 * @param {{
 *      name: string,
 *      description: string,
 *      dataCamposArmonicos: [{
 *          Escala: string,
 *          EscalaPrioridad: int,
 *          KeyNote: string,
 *          KeyNotePrioridad: int,
 *          NombreCifrado: string,
 *          Tension: string,
 *          Tipo: 0 | 1 (tetrada | triada),
 *          ConfiguracionAcordeJazzId: int,
 *          EstadosAcorde: string,
 *      }],
 *      escalaDiatonicaRegla: [{
 *          Tonalidad: string,
 *          Prioridad: int,
 *          ConfiguracionAcordeJazzId: int,
 *      }]}} req.body
 * @param {{ok: boolean, message: string}} res
 */
async function add(req, res) {
    const getCampoArmonicoToInsert = (camposArmonicos, cajId) => {
        let resultToInsert = [];

        camposArmonicos.forEach((ca) => {
            resultToInsert.push({
                Escala: ca.Escala,
                EscalaPrioridad: ca.EscalaPrioridad,
                KeyNote: ca.KeyNote,
                KeyNotePrioridad: ca.KeyNotePrioridad,
                NombreCifrado: ca.NombreCifrado,
                Tension: ca.Tension,
                Tipo: ca.Tipo,
                EstadosAcorde: ca.EstadosAcorde,
                ConfiguracionAcordeJazzId: cajId,
            });
        });

        return resultToInsert;
    };

    const getTonalidadesToInsert = (tonalities, cajId) => {
        let resultToInsert = [];

        tonalities.forEach((t) => {
            resultToInsert.push({
                Tonalidad: t.elem,
                Prioridad: t.prioridad,
                ConfiguracionAcordeJazzId: cajId,
            });
        });

        return resultToInsert;
    };

    try {
        const {
            name,
            description,
            dataCamposArmonicos,
            escalaDiatonicaRegla,
        } = req.body;
        const { idModule } = req.query;

        await db.knex.transaction(async (trx) => {
            const cajAdded = await db
                .knex('ConfiguracionAcordeJazz')
                .insert({
                    Nombre: name,
                    Descripcion: description,
                    CreadorUsuarioId: getAuthenticationToken(req).id,
                    ModuloId: idModule,
                })
                .returning(['id'])
                .transacting(trx);

            const idCajAdded = cajAdded[0].id;

            await db
                .knex('ConfiguracionAcordeJazz_CampoArmonico')
                .insert(
                    getCampoArmonicoToInsert(dataCamposArmonicos, idCajAdded)
                )
                .transacting(trx);

            await db
                .knex('ConfiguracionAcordeJazz_Tonalidad')
                .insert(getTonalidadesToInsert(escalaDiatonicaRegla, idCajAdded))
                .transacting(trx);            
        });

        res.status(200).send({
            ok: true,
            message: 'Configuracion acorde jazz creada correctamente.',
        });
    } catch (error) {
        logError('configuracionAcordeJazz/add', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

/**
 * 
 * @param {int} req.params.id
 * @param {{
 *      name: string,
 *      description: string,
 *      dataCamposArmonicos: [{
 *          Escala: string,
 *          EscalaPrioridad: int,
 *          KeyNote: string,
 *          KeyNotePrioridad: int,
 *          NombreCifrado: string,
 *          Tension: string,
 *          Tipo: 0 | 1 (tetrada | triada),
 *          ConfiguracionAcordeJazzId: int,
 *      }],
 *      escalaDiatonicaRegla: [{
 *          Tonalidad: string,
 *          Prioridad: int,
 *          ConfiguracionAcordeJazzId: int,
 *      }]
 *      }} res.configAcordeJazz
 */
async function get(req, res) {
    try {
        const { id } = req.params;

        const cajs = await db
            .knex('ConfiguracionAcordeJazz')
            .where({ 'ConfiguracionAcordeJazz.id': id })
            .select(
                'ConfiguracionAcordeJazz.id',
                'ConfiguracionAcordeJazz.Nombre',
                'ConfiguracionAcordeJazz.Descripcion',
                'ConfiguracionAcordeJazz.ModuloId'
            );
        const caj = cajs[0];

        const camposArmonicos = await db
            .knex('ConfiguracionAcordeJazz_CampoArmonico')
            .where({ 'ConfiguracionAcordeJazzId': id })
            .select(
                'ConfiguracionAcordeJazz_CampoArmonico.Escala',
                'ConfiguracionAcordeJazz_CampoArmonico.EscalaPrioridad',
                'ConfiguracionAcordeJazz_CampoArmonico.KeyNote',
                'ConfiguracionAcordeJazz_CampoArmonico.KeyNotePrioridad',
                'ConfiguracionAcordeJazz_CampoArmonico.NombreCifrado',
                'ConfiguracionAcordeJazz_CampoArmonico.Tension',
                'ConfiguracionAcordeJazz_CampoArmonico.Tipo',
                'ConfiguracionAcordeJazz_CampoArmonico.ConfiguracionAcordeJazzId',
                'ConfiguracionAcordeJazz_CampoArmonico.EstadosAcorde',
            );

        const tonalities = await db
            .knex('ConfiguracionAcordeJazz_Tonalidad')
            .where({ 'ConfiguracionAcordeJazzId': id })
            .select(
                'ConfiguracionAcordeJazz_Tonalidad.Tonalidad',
                'ConfiguracionAcordeJazz_Tonalidad.Prioridad',
                'ConfiguracionAcordeJazz_Tonalidad.ConfiguracionAcordeJazzId',
            );

        const data = {
            id: caj.id,
            name: caj.Nombre,
            description: caj.Descripcion,
            dataCamposArmonicos: camposArmonicos,
            escalaDiatonicaRegla: tonalities,
        };

        res.status(200).send({
            ok: true,
            configAcordeJazz: data,
            message: 'Configuracion acorde jazz creada correctamente.',
        });

    } catch (error) {
        logError('configuracionAcordeJazz/get', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    add,
    get,
};
