// Given array of elements (it has to contain id and order fields)
// return list of elements group by id and each group ordered by 'Orden'
// ex: ([ [{id = 0, order, ...}, {id = 1, order ...}], [{id = 2, order, ...}] ])
const GroupByIdAndShortByOrder = (arr) => {
    let ids = [];
    arr.forEach((gm) => {
        if (ids.indexOf(gm.id) === -1) ids.push(gm.id);
    });

    let resultAux = [];
    ids.forEach((id) => {
        resultAux.push(arr.filter((gm) => gm.id === id));
    });

    let result = [];
    resultAux.forEach((r) => {
        result.push(r.sort((x, y) => (x.Orden > y.Orden ? 1 : -1)));
    });

    return result;
};

const orderByDateModuleAndConfig = (modules) => {
    let res;
    res = modules.sort(function(a,b){
        return a.Orden - b.Orden || new Date(a.FechaCreacion) - new Date(b.FechaCreacion);
    });

    let ret = [];
    res.forEach(m => {
        const configOrded = m.configuracion_dictado.sort(function(a,b){
            return a.Orden - b.Orden || new Date(a.FechaCreacion) - new Date(b.FechaCreacion);
        })

        ret.push({
            ...m,
            configuracion_dictado: configOrded,
        });
    });

    return ret;
}

const GroupByModuleAndConfigDict = (dataConfigDictation, dataConfigAcordesJazz, modulesIntervalo, modulesDictadoArmonico) => {
    let res = [];

    // Dictado
    dataConfigDictation.forEach((d) => {
        const i = res.findIndex((module) => module.id == d.id);
        if (i > -1) {
            res[i].configuracion_dictado.push({
                id: d.idConfigDictado,
                Nombre: d.NombreConfigDictado,
                Descripcion: d.DescripcionConfigDictado,
                Tipo: 'ConfiguracionDictado', // table name
                FechaCreacion: d.CreationDateConfigDictado,
                Orden: d.OrdenConfigDictado,
            });
        } else {
            res.push({
                id: d.id,
                Nombre: d.Nombre,
                Descripcion: d.Descripcion,
                FechaCreacion: d.CreationDateModulo,
                Orden: d.OrdenModulo,
                configuracion_dictado: [
                    {
                        id: d.idConfigDictado,
                        Nombre: d.NombreConfigDictado,
                        Descripcion: d.DescripcionConfigDictado,
                        Tipo: 'ConfiguracionDictado', // table name
                        FechaCreacion: d.CreationDateConfigDictado,
                        Orden: d.OrdenConfigDictado,
                    },
                ],
            });
        }
    });

    // Acorde Jazz
    dataConfigAcordesJazz.forEach(d => {
        const i = res.findIndex((module) => module.id == d.id);
        if (i > -1) {
            res[i].configuracion_dictado.push({
                Nombre: d.NombreAcordeJazz,
                Descripcion: d.DescripcionAcordeJazz,
                id: d.idAcordeJazz,
                Tipo: 'ConfiguracionAcordeJazz', // table name
                FechaCreacion: d.CreationDateAcordeJazz,
                Orden: d.OrdenAcordeJazz,
            });
        } else {
            res.push({
                id: d.id,
                Nombre: d.Nombre,
                Descripcion: d.Descripcion,
                FechaCreacion: d.CreationDateModulo,
                Orden: d.OrdenModulo,
                configuracion_dictado: [
                    {
                        Nombre: d.NombreAcordeJazz,
                        Descripcion: d.DescripcionAcordeJazz,
                        id: d.idAcordeJazz,
                        Tipo: 'ConfiguracionAcordeJazz', // table name
                        FechaCreacion: d.CreationDateAcordeJazz,
                        Orden: d.OrdenAcordeJazz,
                    },
                ],
            });
        }
    });

    // Config intervalo
    modulesIntervalo.forEach(d => {
        const i = res.findIndex((module) => module.id == d.id);
        if (i > -1) {
            res[i].configuracion_dictado.push({
                Nombre: d.NombreConfigIntervalo,
                Descripcion: d.DescripcionConfigIntervalo,
                id: d.idConfigIntervalo,
                Tipo: 'ConfiguracionIntervalo', // table name
                FechaCreacion: d.CreationDateConfigIntervalo,
                Orden: d.OrdenConfigIntervalo,
            });
        } else {
            res.push({
                id: d.id,
                Nombre: d.Nombre,
                Descripcion: d.Descripcion,
                FechaCreacion: d.CreationDateModulo,
                Orden: d.OrdenModulo,
                configuracion_dictado: [
                    {
                        Nombre: d.NombreConfigIntervalo,
                        Descripcion: d.DescripcionConfigIntervalo,
                        id: d.idConfigIntervalo,
                        Tipo: 'ConfiguracionIntervalo', // table name
                        FechaCreacion: d.CreationDateConfigIntervalo,
                        Orden: d.OrdenConfigIntervalo,
                    },
                ],
            });
        }
    });

    // Config dictado armonico
    modulesDictadoArmonico.forEach(d => {
        const i = res.findIndex((module) => module.id == d.id);
        if (i > -1) {
            res[i].configuracion_dictado.push({
                Nombre: d.NombreConfigDictadoArmonico,
                Descripcion: d.DescripcionConfigDictadoArmonico,
                id: d.idConfigDictadoArmonico,
                Tipo: 'ConfiguracionDictadoArmonico', // table name
                FechaCreacion: d.CreationDateConfigDictadoArmonico,
                Orden: d.OrdenConfigDictadoArmonico,
            });
        } else {
            res.push({
                id: d.id,
                Nombre: d.Nombre,
                Descripcion: d.Descripcion,
                FechaCreacion: d.CreationDateModulo,
                Orden: d.OrdenModulo,
                configuracion_dictado: [
                    {
                        Nombre: d.NombreConfigDictadoArmonico,
                        Descripcion: d.DescripcionConfigDictadoArmonico,
                        id: d.idConfigDictadoArmonico,
                        Tipo: 'ConfiguracionDictadoArmonico', // table name
                        FechaCreacion: d.CreationDateConfigDictadoArmonico,
                        Orden: d.OrdenConfigDictadoArmonico,
                    },
                ],
            });
        }
    });

    return res;
};

/**
 * 
 * @param {*} figuras = [
                [
                    "4",
                    "4",
                    "8-16-16"
                ],
                [
                    "_4",
                    "8-16-16_4"
                ],
                [
                    "8-16-16_4",
                    "8-16-16"
                ],
                [
                    "_4",
                    "4",
                    "4"
                ],
                [
                    "8-16-16_4",
                    "8-16-16"
                ],
                [
                    "8-16-16_4",
                    "4"
                ],
                [
                    "2",
                    "4"
                ]
            ],
 * @returns [ ["4", "4", "8-16-16"]
["_4", "8-16-16", "_4"]
["8-16-16", "_4", "8-16-16"]
["_4", "4", "4"]
["8-16-16", "_4", "8-16-16"]
["8-16-16", "_4", "4"]
["2", "4"] ]
 */

const GetFigurasSeparadasPorLigaduras = (figuras) => {
    const newFiguras = [];        
    figuras.forEach(figs => {
        const newPulsos = [];
        figs.forEach(f => {
            var crs = f.split('_');
            if (crs[0] !== '') {
                newPulsos.push(crs[0]);
            }
            
            // si tiene mas de un elemento quiere decir que el resto tienen ligaudras
            for (var i = 1; i < crs.length; i++) {
                newPulsos.push('_'.concat(crs[i]));
            }
        })
        newFiguras.push(newPulsos);
    });

    return newFiguras;
}

module.exports = {
    GroupByIdAndShortByOrder,
    GroupByModuleAndConfigDict,
    GetFigurasSeparadasPorLigaduras,
    orderByDateModuleAndConfig,
};
