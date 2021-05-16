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
    //let denominadorValor = dato.DENOMINADOR[denominador];
    for (let i = 0; i < compas.length; i++) {
        res = res + dato.VALOR_DE_NOTA[compas[i]] * denominador;
    }
    return res;
};

const filtrarFiguras = (figuras, cantPulsos, denominador) => {
    let compasActual;
    let resFiguras = [];
    figuras.map((figura) => {
        compasActual = sumarValores(figura, denominador);
        if (compasActual == cantPulsos) {
            resFiguras.push(figura);
        }
    });
    return resFiguras;
};

const getFigurasValida = (conjFigs, nroPulsos, denominador) => {
    let figuras = [];
    let figurasRes = [];
    let figurasResLimpias = [];
    let multiplicador = 2; // luego debo agregarle este valor en base a la figura con valor mas chico
    if (conjFigs.includes('fusa')) {
        multiplicador = 8;
    }
    // obtengo todas las posibles combinaciones de figuras
    for (i = 1; i <= nroPulsos * multiplicador; i++) {
        figuras.push(permutarConRepeticiones(conjFigs, i));
    }
    // filtro segun valor
    figuras.forEach((figurasActual) => {
        figurasRes.push(filtrarFiguras(figurasActual, nroPulsos, denominador));
    });
    //elimino los arreglos vacios
    figurasRes.forEach((actual) => {
        if (actual.length != 0) {
            figurasResLimpias = figurasResLimpias.concat(actual);
        }
    });
    return figurasResLimpias;
};

// PARAMETROS = ( tarjetas de figuras , cantidad de compases ,numerador , denominador )
const generarDictadoRitmico = (
    tarjetas,
    numeroCompases,
    numerador,
    denominador
) => {
    let res = [];
    let dictadosValidos = getFigurasValida(tarjetas, numerador, denominador);
    for (i = 0; i < numeroCompases; i++) {
        res.push(gral.getRandom(dictadosValidos));
    }
    return res;
};

// PARAMETROS = ( tarjetas de figuras , cantidad de compases ,numerador , denominador )
// console.log(generarDictadoRitmico(['redonda','blanca','negra','negra-punto-corchea','corchea-2semicorcheas'],10,3,4))
console.log(
    generarDictadoRitmico(['1', '2', '4', 'd4-8', '8-16-16'], 10, 3, 4)
);

module.exports = {
    generarDictadoRitmico,
    getFigurasValida,
};
