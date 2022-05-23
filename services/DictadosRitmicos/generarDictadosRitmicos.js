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
    let res = 0;

    if (compas.length > 0) {
        for (let i = 0; i < compas.length; i++) {
            if (compas[i].indexOf('_') != -1) {
                // Si compas[i] tiene ligaduras
                // las separo y sumo el valor de cada CR
                const crs = compas[i].split('_');
                crs.forEach((cr) => {
                    res = res + dato.VALOR_DE_NOTA[cr] * denominador;
                });
            } else {
                res = res + dato.VALOR_DE_NOTA[compas[i]] * denominador;
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
    const ligadurasPosibles = ligaduras.filter(
        (ligadura) => ligadura.elem.first == cr
    );
    if (ligadurasPosibles.length == 0) {
        return '';
    } else {
        const ligaduraMust = ligadurasPosibles.find(
            (ligadura) => ligadura.must == true
        );
        if (ligaduraMust) {
            // Si debe ir la ligadura si o si
            return '_' + ligaduraMust.elem.second;
        } else {
            // selecciono en base a la prioridad
            let ligaduraElemPrioridad = [
                {
                    elem: '',
                    prioridad: 1,
                },
            ];
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

// Devuelve un array de figuras correspondiente a un compás
const getPulsoValido = (
    tarjetas,
    ligaduras,
    nroPulsos,
    denominador,
    dictadoParcial
) => {
    try {
        const valorTotal = sumarValores(dictadoParcial, denominador);
        if (valorTotal == nroPulsos) return ['ok', dictadoParcial];
        if (valorTotal > nroPulsos) return ['fail', dictadoParcial];

        var dictado;
        dictado = dictadoParcial;
        let tarjetaElem = '';

        if (dictado.length == 0) {
            tarjetaElem = gral.getElemPrioridad(tarjetas);
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

        // tarjetaElem = gral.getElemPrioridad(tarjetas);
        // tarjetaElem += getLigaduraPrioridad(tarjetaElem, ligaduras);

        dictado.push(tarjetaElem);
        const dictadoResult = getPulsoValido(
            tarjetas,
            ligaduras,
            nroPulsos,
            denominador,
            dictado
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
            newDictado
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
        // new function
        let dictadoValido = getPulsoValido(
            tarjetas,
            ligaduras,
            Number(numerador),
            Number(denominador),
            []
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
