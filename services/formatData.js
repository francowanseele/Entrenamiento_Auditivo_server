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

const GroupByModuleAndConfigDict = (data) => {
    let res = [];
    data.forEach((d) => {
        const i = res.findIndex((module) => module.id == d.id);
        if (i > -1) {
            res[i].configuracion_dictado.push({
                id: d.idConfigDictado,
                Nombre: d.NombreConfigDictado,
                Descripcion: d.DescripcionConfigDictado,
            });
        } else {
            res.push({
                id: d.id,
                Nombre: d.Nombre,
                Descripcion: d.Descripcion,
                configuracion_dictado: [
                    {
                        id: d.idConfigDictado,
                        Nombre: d.NombreConfigDictado,
                        Descripcion: d.DescripcionConfigDictado,
                    },
                ],
            });
        }
    });

    return res;
};

module.exports = {
    GroupByIdAndShortByOrder,
    GroupByModuleAndConfigDict,
};
