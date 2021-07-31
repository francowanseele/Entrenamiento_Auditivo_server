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
    res = 0;
    if (compas.length > 0) {
        for (let i = 0; i < compas.length; i++) {
            res = res + dato.VALOR_DE_NOTA[compas[i]] * denominador;
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

// Devuelve un array de figuras correspondiente a un compás
const getPulsoValido = (tarjetas, nroPulsos, denominador, dictadoParcial) => {
    const valorTotal = sumarValores(dictadoParcial, denominador);
    if (valorTotal == nroPulsos) return ['ok', dictadoParcial];
    if (valorTotal > nroPulsos) return ['fail', dictadoParcial];

    var dictado;
    dictado = dictadoParcial;
    const tarjetaElem = gral.getElemPrioridad(tarjetas);
    dictado.push(tarjetaElem);
    const dictadoResult = getPulsoValido(
        tarjetas,
        nroPulsos,
        denominador,
        dictado
    );

    dictado = dictadoResult[1];

    if (dictadoResult[0] == 'ok') return ['ok', dictado];

    // quitar de tarjeta ultimo elem dictado
    const tarjetasNuevas = quitarTarjeta(tarjetas, dictado[dictado.length - 1]);
    if (tarjetasNuevas.length == 0) return ['fail', dictado];

    const newTarjetaElem = gral.getElemPrioridad(tarjetasNuevas);
    // dictado - 1
    const newDictado = dictado.slice(0, -1);
    newDictado.push(newTarjetaElem);
    return getPulsoValido(tarjetasNuevas, nroPulsos, denominador, newDictado);
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
// PARAMETROS = ( tarjetas de figuras , cantidad de compases ,numerador / denominador, tipoFiguras )
const generarDictadoRitmico = (
    tarjetas,
    numeroCompases,
    numeradorDenominador,
    tipoFiguras
) => {
    let figurasOk = false;
    if (tipoFiguras == 'simples' && dato.FIGURAS.includes(tarjetas[0].elem)) {
        figurasOk = true;
    } else if (
        tipoFiguras == 'compuestas' &&
        dato.FIGURAS_COMPUESTAS.includes(tarjetas[0].elem)
    ) {
        figurasOk = true;
    } else {
        figurasOk = false;
    }
    if (figurasOk) {
        //gestion tarjetas  COMUNES y prioridades
        let tarjetasRes = [];
        for (let j = 0; j < tarjetas.length; j++) {
            tarjetasRes.push(gral.getElemPrioridad(tarjetas));
        }
        //sacar tarjetas repetidas antes de generar los dictados
        let tarjetasSinRepetir = [];
        tarjetasRes.forEach((item) => {
            //pushes only unique element
            if (!tarjetasSinRepetir.includes(item)) {
                tarjetasSinRepetir.push(item);
            }
        });
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

        // let dictadosValidos = getFigurasValida(
        //     tarjetasSinRepetir,
        //     Number(numerador),
        //     Number(denominador),
        //     numeroCompases
        // );

        // for (i = 0; i < numeroCompases; i++) {
        //     res.push(gral.getRandom(dictadosValidos));
        // }

        const dictadoRitmicoResult = {
            dictadoRitmico: res,
            numerador: Number(numerador),
            denominador: Number(denominador),
        };

        return dictadoRitmicoResult;
    } else {
        gral.printError(
            'Figuras invalidas ingresadas. Ingrese figuras ' + tipoFiguras
        );
    }
};

module.exports = {
    generarDictadoRitmico,
    getFigurasValida,
};
