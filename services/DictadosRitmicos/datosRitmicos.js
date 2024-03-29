const VALOR_COMPASES_SIMPLES = [
    '4/4','3/4', '2/4'
]

const VALOR_COMPASES_COMPUESTOS = [
    '6/8','9/8', '12/8'
]

// Los elementos con una T al final indica que son figuras con "techito" para diferenciarlas en el front
// La d indica que llevan un punto
const FIGURAS = [
            '1','2','4','d4-8','d2','8-8',
            '16-16-16-16','8-16-16','16-8-16'         
            ]

const FIGURAS_COMPUESTAS = [
                                'd4','4-8','8-4','8-8-8'
                            ]

// const FIGURAS = [
//                 'redonda','blanca','negra','negra-punto-corchea',
//                 'negra-punto-2semicorchea','blanca-punto','2corcheas',
//                 '4semicorcheas','corchea-2semicorcheas','semicorchea-corchea-semicorchea'
//                 ]

const DENOMINADOR = {
    'redonda':1,
    'blanca':2,
    'negra':4,
    'corchea':8,
    'semicorchea':16,
    'fusa':32,
    'semifusa:':64 
}
const VALOR_DE_NOTA = {
    // SIMPLES
    '1':4/4,
    '2':2/4,
    '4':1/4,
    '8':1/8,
    '16':1/16,
    '32':1/32,
    '64':1/64, 
    // COMPUESTAS
    'd1': 3/2, // 4/4 + 2/4
    'd2': 3/4, // 6/8, // 2/4 + 2/8
    'd4': 3/8, // 2/8 + 1/8 = 3/8
    'd8': 3/16, // 1/8 + 1/16
    'd16': 3/32, // 1/16 + 2/32
    // SILENCIOS SIMPLES
    '1S':4/4,
    '2S':2/4,
    '4S':1/4,
    '8S':1/8,
    '16S':1/16,
    '32S':1/32,
    '64S':1/64, 
    // SILENCIOS COMPUESTAS
    'd1S': 3/2, // 4/4 + 2/4
    'd2S': 3/4, // 6/8, // 2/4 + 2/8
    'd4S': 3/8, // 2/8 + 1/8 = 3/8
    'd8S': 3/16, // 1/8 + 1/16
    'd16S': 3/32, // 1/16 + 2/32
}
// const VALOR_DE_NOTA = {
//     'redonda':4/4,
//     'blanca':2/4,
//     'negra':1/4,
//     'corchea':1/8,
//     'semicorchea':1/16,
//     'fusa':1/32,
//     'semifusa':1/64,
//     'negra-punto-corchea':1/2 ,//1/4+1/8+1/8
//     'negra-punto-2semicorchea':5/8,//1/4+1/8+2/8
//     'blanca-punto':3/4, //2/4 +1/4,
//     '2corcheas':1/4,
//     '4semicorcheas':1/4, // 4/16
//     'corchea-2semicorcheas':1/4, // 1/8+2/16=2/8=1/4
//     'semicorchea-corchea-semicorchea':1/4,
// }

module.exports = {
    FIGURAS,
    DENOMINADOR,
    VALOR_DE_NOTA,
    FIGURAS_COMPUESTAS,
    VALOR_COMPASES_SIMPLES,
    VALOR_COMPASES_COMPUESTOS
}
