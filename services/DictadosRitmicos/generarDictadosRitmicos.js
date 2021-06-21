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
    if (compas.length > 0){ 
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
        resFiguras =  resFiguras.concat(figuras);
    }
    // });
    return resFiguras;
};

const getFigurasValida = (conjFigs, nroPulsos, denominador,numeroCompases) => {
    let figurasRes = [];
    let fig;
    let compasPosible;
    let compasFiltrado;

    //genero compases hasta completar la cantidad de compases solicitado y filtrando los compases de valores invalidos. 
    do {
        compasPosible = [];
        compasFiltrado = [];
        while ( sumarValores(compasPosible,denominador) < nroPulsos ){ 
        fig = gral.getRandom(conjFigs)
        compasPosible.push(fig);
        }
        // console.log(compasFiltrado)
        compasFiltrado = filtrarFiguras(compasPosible, nroPulsos, denominador);
        // console.log('despues ==>' ); console.log(compasFiltrado)
        if (compasFiltrado.length != 0 ){
            figurasRes.push(compasFiltrado);
        }
        
    }while (figurasRes.length < numeroCompases );

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
    if ( tipoFiguras == 'simples' && dato.FIGURAS.includes(tarjetas[0].elem)  ){
        figurasOk = true;
    } else  if ( tipoFiguras == 'compuestas' && dato.FIGURAS_COMPUESTAS.includes(tarjetas[0].elem) ){
        figurasOk = true;
    } else { figurasOk = false }

    if ( figurasOk ){
        //gestion tarjetas  COMUNES y prioridades
        let tarjetasRes =[];
        for (let j =0; j< tarjetas.length; j++){
            tarjetasRes.push(gral.getElemPrioridad(tarjetas));
        }
        //sacar tarjetas repetidas antes de generar los dictados
        let tarjetasSinRepetir = [];
        tarjetasRes.forEach((item)=>{
            //pushes only unique element
            if(!tarjetasSinRepetir.includes(item)){
                tarjetasSinRepetir.push(item);
            }
        })

        //gestion numerador y denominador
        let numeradorDenominadorRes = '';
        numeradorDenominadorRes = gral.getElemPrioridad(numeradorDenominador);
        let numeradorDenominadorRes2 = numeradorDenominadorRes.split('/')
        let numerador = numeradorDenominadorRes2[0];
        let denominador = numeradorDenominadorRes2[1];

        let res = [];
        console.log(tarjetasSinRepetir);
        let dictadosValidos = getFigurasValida(tarjetasSinRepetir, Number(numerador), Number(denominador),numeroCompases);
        for (i = 0; i < numeroCompases; i++) {
            res.push(gral.getRandom(dictadosValidos));
        }
        // console.log(res)
        result = {
                    dictadoRitmico: res,
                    numerador: Number(numerador),
                    denominador:  Number(denominador)
                }
        return result;
        }else {
            gral.printError('Figuras invalidas ingresadas. Ingrese figuras '+ tipoFiguras)
        }
};

console.log(generarDictadoRitmico(
            [
            {elem:'d4',prioridad:1}, 
            {elem:'4-8',prioridad:1}, 
            {elem:'8-4',prioridad:1},
            {elem:'4-4-4T',prioridad:1}
            // {elem:'16-16-16-16T',prioridad:1},
            // {elem:'8-8T',prioridad:1},
            // {elem:'8-16-16T',prioridad:1},
            // {elem:'4',prioridad:1},
            // {elem:'2',prioridad:1},
            // {elem:'1',prioridad:1},
            // {elem:'16-8-16T',prioridad:1}                
            ],
        5,
        [
            // {elem:'4/4', prioridad:1},
            // {elem:'3/4', prioridad:0},
            // {elem:'2/4', prioridad:0}
            {elem:'6/8',prioridad:1},
            {elem:'9/8',prioridad:1},
            {elem:'12/8',prioridad:1}  
        ],
        'compuestas'
        )) 



module.exports = {
    generarDictadoRitmico,    
};
