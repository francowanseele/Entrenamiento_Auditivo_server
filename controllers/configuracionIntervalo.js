const db = require('../data/knex');
const { logError } = require('../services/errorService');
const { getAuthenticationToken } = require('../services/headers');

/**
 *
 * @param {{
 *      name: string,
 *      description: string,
 *      dataIntervalos: {
 *          PrioridadClaveSol: int,
 *          PrioridadClaveFa: int,
 *          Direccion: 0 | 1 | 2 (ascendente | descendente | ambas),
 *          Tipo: 0 | 1 | 2 (melodico | armonico | ambos),
 *      },
 *      intervaloRegla: [{
 *          Intervalo: string,
 *          Prioridad: int,
 *      }]}} req.body
 * @param {{ok: boolean, message: string}} res
 */
async function add(req, res) {
    const getIntervaloToInsert = (intervalos, id) => {
        let resultToInsert = [];

        intervalos.forEach((i) => {
            resultToInsert.push({
                Intervalo: i.Intervalo,
                Prioridad: i.Prioridad,
                ConfiguracionIntervaloId: id,
            });
        });

        return resultToInsert;
    };

    try {
        const {
            name,
            description,
            dataIntervalos,
            intervaloRegla,
        } = req.body;
        const { idModule } = req.query;

        await db.knex.transaction(async (trx) => {
            const configIntervaloAdded = await db
                .knex('ConfiguracionIntervalo')
                .insert({
                    Nombre: name,
                    Descripcion: description,
                    CreadorUsuarioId: getAuthenticationToken(req).id,
                    ModuloId: idModule,
                    PrioridadClaveSol: dataIntervalos.PrioridadClaveSol,
                    PrioridadClaveFa: dataIntervalos.PrioridadClaveFa,
                    Direccion: dataIntervalos.Direccion,
                    Tipo: dataIntervalos.Tipo,
                })
                .returning(['id'])
                .transacting(trx);

            const idConfigIntervaloAdded = configIntervaloAdded[0].id;

            await db
                .knex('ConfiguracionIntervalo_Intervalo')
                .insert(
                    getIntervaloToInsert(intervaloRegla, idConfigIntervaloAdded)
                )
                .transacting(trx);         
        });

        res.status(200).send({
            ok: true,
            message: 'Configuracion Intervalo creada correctamente.',
        });
    } catch (error) {
        logError('configuracionIntervalo/add', error, req);
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
 *      dataIntervalos: {
 *          PrioridadClaveSol: int,
 *          PrioridadClaveFa: int,
 *          Direccion: 0 | 1 | 2 (ascendente | descendente | ambas),
 *          Tipo: 0 | 1 | 2 (melodico | armonico | ambos),
 *      },
 *      intervaloRegla: [{
 *          Intervalo: string,
 *          Prioridad: int,
 *      }]}} res.configIntervalo
 */
async function get(req, res) {
    try {
        const { id } = req.params;

        const configIntervalos = await db
            .knex('ConfiguracionIntervalo')
            .where({ 'ConfiguracionIntervalo.id': id })
            .select(
                'ConfiguracionIntervalo.id',
                'ConfiguracionIntervalo.Nombre',
                'ConfiguracionIntervalo.Descripcion',
                'ConfiguracionIntervalo.ModuloId',
                'ConfiguracionIntervalo.PrioridadClaveSol',
                'ConfiguracionIntervalo.PrioridadClaveFa',
                'ConfiguracionIntervalo.Direccion',
                'ConfiguracionIntervalo.Tipo',
            );
        const configInt = configIntervalos[0];

        const intervalosPrioridad = await db
            .knex('ConfiguracionIntervalo_Intervalo')
            .where({ 'ConfiguracionIntervaloId': id })
            .select(
                'ConfiguracionIntervalo_Intervalo.ConfiguracionIntervaloId',
                'ConfiguracionIntervalo_Intervalo.Intervalo',
                'ConfiguracionIntervalo_Intervalo.Prioridad',
            );

        const data = {
            id: configInt.id,
            name: configInt.Nombre,
            description: configInt.Descripcion,
            dataIntervalos: {
                PrioridadClaveSol: configInt.PrioridadClaveSol,
                PrioridadClaveFa: configInt.PrioridadClaveFa,
                Direccion: configInt.Direccion,
                Tipo: configInt.Tipo,
            },
            intervaloRegla: intervalosPrioridad,
        };

        res.status(200).send({
            ok: true,
            configIntervalo: data,
            message: 'Configuracion intervalo obtenida correctamente.',
        });

    } catch (error) {
        logError('configuracionIntervalo/get', error, req);
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
