const dato = require('./datosRitmicos');
const gral = require('../Dictados_FuncGral/funcionesGenerales');

const permutarConRepeticiones = (permutationOptions, permutationLength) => {
    if (permutationLength === 1) {
        return permutationOptions.map((permutationOption) => [
            permutationOption,
        ]);
    }

    const permutations = [];

    const smallerPermutations = permutarConRepeticiones(
        permutationOptions,
        permutationLength - 1
    );

    permutationOptions.forEach((currentOption) => {
        smallerPermutations.forEach((smallerPermutation) => {
            permutations.push([currentOption].concat(smallerPermutation));
        });
    });

    return permutations;
};

const sumarValores = (compas, denominador) => {
    const valorDeNotaSumado = (cr) => {
        let res = 0;
        const figs = cr.split('-');
        figs.forEach(f => {
            res = res + dato.VALOR_DE_NOTA[f];
        });

        return res;
    }

    let res = 0;

    if (compas.length > 0) {
        for (let i = 0; i < compas.length; i++) {
            if (compas[i].indexOf('_') != -1) {
                // Si compas[i] tiene ligaduras
                // las separo y sumo el valor de cada CR
                const crs = compas[i].split('_');
                crs.forEach((cr) => {
                    if (cr != '') {
                        res = res + valorDeNotaSumado(cr) * denominador;
                    }
                });
            } else {
                res = res + valorDeNotaSumado(compas[i]) * denominador;
            }
        }
    }
    return res;
};

const filtrarFiguras = (figuras, cantPulsos, denominador) => {
    let compasActual;
    let resFiguras = [];
    // figuras.map((figura) => {
    compasActual = sumarValores(figuras, denominador);
    if (compasActual == cantPulsos) {
        resFiguras = resFiguras.concat(figuras);
    }
    // });
    return resFiguras;
};

const quitarTarjeta = (tarjetas, elem) => {
    var result = [];
    tarjetas.forEach((t) => {
        if (t.elem != elem) {
            result.push(t);
        }
    });

    return result;
};

// A partir de cr selecciono una ligadura (si es que existe)
// En base a una prioridad
const getLigaduraPrioridad = (cr, ligaduras) => {
    let ligadurasPosibles = ligaduras.filter(
        (ligadura) => ligadura.elem.first == cr
    );
    if (ligadurasPosibles.length == 0) {
        return '';
    } else {
        let ligaduraElemPrioridad = [];
        const ligadurasMust = ligadurasPosibles.filter((l) => l.must == true);
        if (ligadurasMust.length > 0) {
            ligadurasPosibles = ligadurasMust;
        } else {
            // Agrego la posibilidad de que no haya ninguna ligadura
            ligaduraElemPrioridad.push({
                elem: '',
                prioridad: 1,
            });
        }

        // selecciono en base a la prioridad
        ligadurasPosibles.forEach((l) => {
            ligaduraElemPrioridad.push({
                elem: l.elem.second,
                prioridad: l.priority,
            });
        });

        const ligaduraResult = gral.getElemPrioridad(ligaduraElemPrioridad);

        if (ligaduraResult == '') {
            return ligaduraResult;
        } else {
            return '_' + ligaduraResult;
        }
    }
};

const getLastCR = (cr) => {
    if (cr.indexOf('_') != -1) {
        const crs = cr.split('_');
        return crs[crs.length - 1];
    } else {
        return cr;
    }
};

// retorna true si cr si o si tiene que llevar una ligadura
const mustToHaveLigadura = (cr, ligaduras) => {
    const lastCR = getLastCR(cr);
    let ligadurasPosibles = ligaduras.filter(
        (ligadura) => ligadura.elem.first == lastCR
    );

    const ligadurasMust = ligadurasPosibles.filter((l) => l.must == true);

    return ligadurasMust.length > 0;
};

// Devuelve un array de figuras correspondiente a un compás
const getPulsoValido = (
    tarjetas,
    ligaduras,
    nroPulsos,
    denominador,
    dictadoParcial,
    compasesAnterior,
    ultimoCompas
) => {
    try {
        const valorTotal = sumarValores(dictadoParcial, denominador);
        if (valorTotal == nroPulsos) {
            // chequeo si la ultima CR del dictado debe llevar ligadura
            if (
                ultimoCompas &&
                mustToHaveLigadura(
                    dictadoParcial[dictadoParcial.length - 1],
                    ligaduras
                )
            ) {
                return ['fail', dictadoParcial];
            } else {
                return ['ok', dictadoParcial];
            }
        }
        if (valorTotal > nroPulsos) return ['fail', dictadoParcial];

        var dictado;
        dictado = dictadoParcial;
        let tarjetaElem = '';

        if (dictado.length == 0) {
            if (compasesAnterior.length == 0) {
                tarjetaElem = gral.getElemPrioridad(tarjetas);
            } else {
                const lastCompas =
                    compasesAnterior[compasesAnterior.length - 1];
                const lastCR = getLastCR(lastCompas[lastCompas.length - 1]);
                const l = getLigaduraPrioridad(lastCR, ligaduras);
                if (l == '') {
                    tarjetaElem = gral.getElemPrioridad(tarjetas);
                } else {
                    tarjetaElem = l;
                }
            }
        } else {
            const lastCR = getLastCR(dictado[dictado.length - 1]);
            const l = getLigaduraPrioridad(lastCR, ligaduras);
            if (l == '') {
                tarjetaElem = gral.getElemPrioridad(tarjetas);
            } else {
                tarjetaElem = dictado[dictado.length - 1] + l;
                dictado.pop();
            }
        }

        dictado.push(tarjetaElem);
        const dictadoResult = getPulsoValido(
            tarjetas,
            ligaduras,
            nroPulsos,
            denominador,
            dictado,
            compasesAnterior,
            ultimoCompas
        );

        dictado = dictadoResult[1];

        if (dictadoResult[0] == 'ok') return ['ok', dictado];

        // quitar de tarjeta ultimo elem dictado
        const tarjetasNuevas = quitarTarjeta(
            tarjetas,
            dictado[dictado.length - 1]
        );
        if (tarjetasNuevas.length == 0) return ['fail', dictado];

        let newTarjetaElem = gral.getElemPrioridad(tarjetasNuevas);
        // dictado - 1
        let newDictado = dictado.slice(0, -1);
        newTarjetaElem += getLigaduraPrioridad(newTarjetaElem, ligaduras);

        newDictado.push(newTarjetaElem);
        return getPulsoValido(
            tarjetasNuevas,
            ligaduras,
            nroPulsos,
            denominador,
            newDictado,
            compasesAnterior,
            ultimoCompas
        );
    } catch (error) {
        console.log('ERROR');
        console.log(error);
    }
};

const getFigurasValida = (conjFigs, nroPulsos, denominador, numeroCompases) => {
    let figurasRes = [];
    let fig;
    let compasPosible;
    let compasFiltrado;

    //genero compases hasta completar la cantidad de compases solicitado y filtrando los compases de valores invalidos.
    do {
        compasPosible = [];
        compasFiltrado = [];
        while (sumarValores(compasPosible, denominador) < nroPulsos) {
            fig = gral.getRandom(conjFigs);
            compasPosible.push(fig);
        }

        compasFiltrado = filtrarFiguras(compasPosible, nroPulsos, denominador);

        if (compasFiltrado.length != 0) {
            figurasRes.push(compasFiltrado);
        }
    } while (figurasRes.length < numeroCompases);

    return figurasRes;
};

// Genera un dictado ritmico aleatorio  en base al conjunto de figuras que se le pasa, cantidad de compases, numerador, denominador y el tipo de figuras
// PARAMETROS = ( tarjetas de figuras , ligaduras, cantidad de compases ,numerador / denominador, tipoFiguras )
const generarDictadoRitmico = (
    tarjetas,
    ligaduras,
    numeroCompases,
    numeradorDenominador,
    tipoFiguras
) => {
    {
        // ---------------------------------------------------------------------------
        // NO PODEMOS CONTROLAR QUE ALGUN ELEMENTO DE TARJEGAS ESTÉ EN DATO.FIGURAS
        // LOS ELEMENTOS DE TARJETAS VAN A SER DINÁMICOS
        // ---------------------------------------------------------------------------
        // let figurasOk = false;
        // if (tipoFiguras == 'simples' && dato.FIGURAS.includes(tarjetas[0].elem)) {
        //     figurasOk = true;
        // } else if (
        //     tipoFiguras == 'compuestas' &&
        //     dato.FIGURAS_COMPUESTAS.includes(tarjetas[0].elem)
        // ) {
        //     figurasOk = true;
        // } else {
        //     figurasOk = false;
        // }
        // if (figurasOk) {
        //gestion tarjetas  COMUNES y prioridades
    }

    //gestion numerador y denominador
    let numeradorDenominadorRes = '';
    numeradorDenominadorRes = gral.getElemPrioridad(numeradorDenominador);
    let numeradorDenominadorRes2 = numeradorDenominadorRes.split('/');
    let numerador = numeradorDenominadorRes2[0];
    let denominador = numeradorDenominadorRes2[1];
    let res = [];

    var i = 0;
    var max_i = 0;
    while (i < numeroCompases && max_i < 25) {
        const ultimoCompas = i == numeroCompases - 1;
        // new function
        let dictadoValido = getPulsoValido(
            tarjetas,
            ligaduras,
            Number(numerador),
            Number(denominador),
            [],
            res,
            ultimoCompas
        );

        if (dictadoValido[0] == 'ok') {
            res.push(dictadoValido[1]);
            i++;
        } else {
            max_i++;
        }
    }

    const dictadoRitmicoResult = {
        dictadoRitmico: res,
        numerador: Number(numerador),
        denominador: Number(denominador),
    };

    return dictadoRitmicoResult;
    {
        // } else {
        //     gral.printError(
        //         'Figuras invalidas ingresadas. Ingrese figuras ' + tipoFiguras
        //     );
        // }
    }
};

module.exports = {
    generarDictadoRitmico,
    getFigurasValida,
};
