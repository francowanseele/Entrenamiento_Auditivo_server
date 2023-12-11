const db = require('../data/knex');
const { logError } = require('../services/errorService');
const { getAuthenticationToken } = require('../services/headers');

async function add(req, res) {
    const getCampoArmonicoToInsertWithTonicalizacion = (camposArmonicos, cdaId) => {
        let resultToInsert = [];

        camposArmonicos.forEach((ca) => {
            resultToInsert.push({
                Nivel: ca.Nivel,
                From: ca.From,
                Tonicalizado: ca.Tonicalizado,
                Funcion: ca.Funcion,
                Escala: ca.Escala,
                EscalaPrioridad: ca.EscalaPrioridad,
                KeyNote: ca.KeyNote,
                KeyNotePrioridad: ca.KeyNotePrioridad,
                NombreCifrado: ca.NombreCifrado,
                Tension: ca.Tension,
                Tipo: ca.Tipo,
                EstadosAcorde: ca.EstadosAcorde,
                ConfiguracionDictadoArmonicoId: cdaId,
            });
        });

        return resultToInsert;
    };

    const getCampoArmonicoToInsert = (camposArmonicos, cdaId) => {
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
                ConfiguracionDictadoArmonicoId: cdaId,
            });
        });

        return resultToInsert;
    };

    const getTonalidadesToInsert = (tonalities, cdaId) => {
        let resultToInsert = [];

        tonalities.forEach((t) => {
            resultToInsert.push({
                Tonalidad: t.elem,
                Prioridad: t.prioridad,
                ConfiguracionDictadoArmonicoId: cdaId,
            });
        });

        return resultToInsert;
    };

    try {
        const {
            name,
            description,
            dataCamposArmonicos,
            dataCamposArmonicosInicio,
            dataCamposArmonicosFin,
            dataCamposArmonicosReferencia,
            escalaDiatonicaRegla,
            dictationLength,
        } = req.body;
        const { idModule } = req.query;

        await db.knex.transaction(async (trx) => {
            const cdaAdded = await db
                .knex('ConfiguracionDictadoArmonico')
                .insert({
                    Nombre: name,
                    Descripcion: description,
                    CreadorUsuarioId: getAuthenticationToken(req).id,
                    ModuloId: idModule,
                    Eliminado: false,
                    Orden: 9999,
                    Largo: dictationLength,
                })
                .returning(['id'])
                .transacting(trx);

            const idCdaAdded = cdaAdded[0].id;

            await db
                .knex('ConfiguracionDictadoArmonico_CampoArmonico')
                .insert(
                    getCampoArmonicoToInsertWithTonicalizacion(dataCamposArmonicos, idCdaAdded)
                )
                .transacting(trx);

            await db
                .knex('ConfiguracionDictadoArmonico_CampoArmonicoInicio')
                .insert(
                    getCampoArmonicoToInsert(dataCamposArmonicosInicio, idCdaAdded)
                )
                .transacting(trx);
            
            await db
                .knex('ConfiguracionDictadoArmonico_CampoArmonicoFin')
                .insert(
                    getCampoArmonicoToInsert(dataCamposArmonicosFin, idCdaAdded)
                )
                .transacting(trx);

            await db
                .knex('ConfiguracionDictadoArmonico_CampoArmonicoReferencia')
                .insert(
                    getCampoArmonicoToInsert(dataCamposArmonicosReferencia, idCdaAdded)
                )
                .transacting(trx);

            await db
                .knex('ConfiguracionDictadoArmonico_Tonalidad')
                .insert(getTonalidadesToInsert(escalaDiatonicaRegla, idCdaAdded))
                .transacting(trx);            
        });

        res.status(200).send({
            ok: true,
            message: 'Configuracion dictado armonico creada correctamente.',
        });
    } catch (error) {
        logError('configuracionDictadoArmonico/add', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function get(req, res) {
    try {
        const { id } = req.params;

        const configDictadosArmonicos = await db
            .knex('ConfiguracionDictadoArmonico')
            .where({ 'ConfiguracionDictadoArmonico.id': id })
            .select(
                'ConfiguracionDictadoArmonico.id',
                'ConfiguracionDictadoArmonico.Nombre',
                'ConfiguracionDictadoArmonico.Descripcion',
                'ConfiguracionDictadoArmonico.ModuloId',
                'ConfiguracionDictadoArmonico.Largo',
            );
        const configDictado = configDictadosArmonicos[0];

        const camposArmonicos = await db
            .knex('ConfiguracionDictadoArmonico_CampoArmonico')
            .where({ 'ConfiguracionDictadoArmonicoId': id })
            .select(
                'ConfiguracionDictadoArmonico_CampoArmonico.Escala',
                'ConfiguracionDictadoArmonico_CampoArmonico.EscalaPrioridad',
                'ConfiguracionDictadoArmonico_CampoArmonico.KeyNote',
                'ConfiguracionDictadoArmonico_CampoArmonico.KeyNotePrioridad',
                'ConfiguracionDictadoArmonico_CampoArmonico.NombreCifrado',
                'ConfiguracionDictadoArmonico_CampoArmonico.Tension',
                'ConfiguracionDictadoArmonico_CampoArmonico.Tipo',
                'ConfiguracionDictadoArmonico_CampoArmonico.ConfiguracionDictadoArmonicoId',
                'ConfiguracionDictadoArmonico_CampoArmonico.EstadosAcorde',
                'ConfiguracionDictadoArmonico_CampoArmonico.Nivel',
                'ConfiguracionDictadoArmonico_CampoArmonico.Tonicalizado',
                'ConfiguracionDictadoArmonico_CampoArmonico.From',
                'ConfiguracionDictadoArmonico_CampoArmonico.Funcion',
            );

        const camposArmonicosInicio = await db
            .knex('ConfiguracionDictadoArmonico_CampoArmonicoInicio')
            .where({ 'ConfiguracionDictadoArmonicoId': id })
            .select(
                'ConfiguracionDictadoArmonico_CampoArmonicoInicio.Escala',
                'ConfiguracionDictadoArmonico_CampoArmonicoInicio.EscalaPrioridad',
                'ConfiguracionDictadoArmonico_CampoArmonicoInicio.KeyNote',
                'ConfiguracionDictadoArmonico_CampoArmonicoInicio.KeyNotePrioridad',
                'ConfiguracionDictadoArmonico_CampoArmonicoInicio.NombreCifrado',
                'ConfiguracionDictadoArmonico_CampoArmonicoInicio.Tension',
                'ConfiguracionDictadoArmonico_CampoArmonicoInicio.Tipo',
                'ConfiguracionDictadoArmonico_CampoArmonicoInicio.ConfiguracionDictadoArmonicoId',
                'ConfiguracionDictadoArmonico_CampoArmonicoInicio.EstadosAcorde',
            );

        const camposArmonicosFin = await db
            .knex('ConfiguracionDictadoArmonico_CampoArmonicoFin')
            .where({ 'ConfiguracionDictadoArmonicoId': id })
            .select(
                'ConfiguracionDictadoArmonico_CampoArmonicoFin.Escala',
                'ConfiguracionDictadoArmonico_CampoArmonicoFin.EscalaPrioridad',
                'ConfiguracionDictadoArmonico_CampoArmonicoFin.KeyNote',
                'ConfiguracionDictadoArmonico_CampoArmonicoFin.KeyNotePrioridad',
                'ConfiguracionDictadoArmonico_CampoArmonicoFin.NombreCifrado',
                'ConfiguracionDictadoArmonico_CampoArmonicoFin.Tension',
                'ConfiguracionDictadoArmonico_CampoArmonicoFin.Tipo',
                'ConfiguracionDictadoArmonico_CampoArmonicoFin.ConfiguracionDictadoArmonicoId',
                'ConfiguracionDictadoArmonico_CampoArmonicoFin.EstadosAcorde',
            );

        const camposArmonicosReferencia = await db
            .knex('ConfiguracionDictadoArmonico_CampoArmonicoReferencia')
            .where({ 'ConfiguracionDictadoArmonicoId': id })
            .select(
                'ConfiguracionDictadoArmonico_CampoArmonicoReferencia.Escala',
                'ConfiguracionDictadoArmonico_CampoArmonicoReferencia.EscalaPrioridad',
                'ConfiguracionDictadoArmonico_CampoArmonicoReferencia.KeyNote',
                'ConfiguracionDictadoArmonico_CampoArmonicoReferencia.KeyNotePrioridad',
                'ConfiguracionDictadoArmonico_CampoArmonicoReferencia.NombreCifrado',
                'ConfiguracionDictadoArmonico_CampoArmonicoReferencia.Tension',
                'ConfiguracionDictadoArmonico_CampoArmonicoReferencia.Tipo',
                'ConfiguracionDictadoArmonico_CampoArmonicoReferencia.ConfiguracionDictadoArmonicoId',
                'ConfiguracionDictadoArmonico_CampoArmonicoReferencia.EstadosAcorde',
            );

        const tonalities = await db
            .knex('ConfiguracionDictadoArmonico_Tonalidad')
            .where({ 'ConfiguracionDictadoArmonicoId': id })
            .select(
                'ConfiguracionDictadoArmonico_Tonalidad.Tonalidad',
                'ConfiguracionDictadoArmonico_Tonalidad.Prioridad',
                'ConfiguracionDictadoArmonico_Tonalidad.ConfiguracionDictadoArmonicoId',
            );

        const data = {
            id: configDictado.id,
            name: configDictado.Nombre,
            description: configDictado.Descripcion,
            dictationLength: configDictado.Largo,
            dataCamposArmonicos: camposArmonicos,
            dataCamposArmonicosInicio: camposArmonicosInicio,
            dataCamposArmonicosFin: camposArmonicosFin,
            dataCamposArmonicosReferencia: camposArmonicosReferencia,
            escalaDiatonicaRegla: tonalities,
        };

        res.status(200).send({
            ok: true,
            configDictadoArmonico: data,
            message: 'Configuracion Dictado Armónico obtenida correctamente.',
        });

    } catch (error) {
        logError('configuracionDictadoArmonico/get', error, req);
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

