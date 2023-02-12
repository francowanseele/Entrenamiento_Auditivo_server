const db = require('../data/knex');
const { logError } = require('../services/errorService');
const { getAuthenticationToken } = require('../services/headers');

async function add(req, res) {
    try {
        const { name, level, subGrupoId } = req.body;

        const grupoAdded = await db
            .knex('GiroMelodico_Grupo')
            .insert({
                Nombre: name,
                Nivel: level,
                SubGrupoId: subGrupoId,
                created_by: getAuthenticationToken(req).id,
            })
            .returning(['id', 'Nombre', 'Nivel', 'SubGrupoId']);


        res.status(200).send({
            ok: true,
            element: grupoAdded[0],
            message: 'Giro Melódico Grupo creado correctamente',
        });
    } catch (error) {
        logError('giro_melodico_grupo/add', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function edit(req, res) {
    try {
        const { id } = req.params;
        const { name, level, subGrupoId } = req.body;

        const grupoEdited = await db
            .knex('GiroMelodico_Grupo')
            .where({ 'GiroMelodico_Grupo.id': id })
            .update({
                'Nombre': name,
                'Nivel': level,
                'SubGrupoId': subGrupoId,
                'updated_by': getAuthenticationToken(req).id,
            })
            .returning(['id', 'Nombre', 'Nivel', 'SubGrupoId']);

        if(grupoEdited && grupoEdited.length > 0) {
            res.status(200).send({
                ok: true,
                course: grupoEdited[0],
                message: 'Grupo editado correctamente',
            });
        }
    } catch (error) {
        logError('giro_melodico_grupo/edit', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function remove(req, res) {
    try {
        const { id } = req.params;

        await db.knex.transaction(async (trx) => {
            // Update GiroMelodico
            await db
                .knex('GiroMelodico')
                .where({ 'GrupoId': id })
                .update({
                    'GrupoId': null,
                    'updated_by': getAuthenticationToken(req).id,
                })
                .transacting(trx);

            const subgruposAnidados = await db
                .knex('GiroMelodico_Grupo')
                .where({ 'SubGrupoId': id })
                .select('id')
                .transacting(trx);

            await db
                .knex('GiroMelodico')
                .whereIn( 'GrupoId', subgruposAnidados.map(x => x.id) )
                .update({
                    'GrupoId': null,
                    'updated_by': getAuthenticationToken(req).id,
                })
                .transacting(trx);

            // Delete grupos and subgrupos
            await db
                .knex('GiroMelodico_Grupo')
                .where({ 'SubGrupoId': id })
                .del()
                .transacting(trx);

            await db
                .knex('GiroMelodico_Grupo')
                .where({ 'id': id })
                .del()
                .transacting(trx);

        });

        res.status(200).send({
            ok: true,
            message: 'Grupo eliminado correctamente',
        });
    } catch (error) {
        logError('giro_melodico_grupo/del', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getAll(req, res) {
    try {
        const gmGrupo = await db
            .knex('GiroMelodico_Grupo')
            .returning(['id', 'Nombre', 'Nivel', 'SubGrupoId']);

        const gmGrupoRaiz = gmGrupo.filter(gm => gm.Nivel == 0);

        let result = [];
        gmGrupoRaiz.forEach(root => {
            const gmGrupoRelatedWithRoot = gmGrupo.filter(gm => gm.SubGrupoId == root.id);
            result.push({
                id: root.id,
                Nombre: root.Nombre,
                Nivel: root.Nivel,
                subGrupo: gmGrupoRelatedWithRoot,
            });
        });

        res.status(200).send({
            ok: true,
            girosMelodicosGrupo: result,
            message: 'Lista de griros melodicos grupo',
        });
    } catch (error) {
        logError('giro_melodico_grupo/getAll', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    add,
    edit,
    remove,
    getAll,
}
