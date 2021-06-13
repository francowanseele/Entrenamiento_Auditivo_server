const FIGURAS = [
            '1','2','4','d4-8',
            'd4-16-16','d2','8-8',
            '16-16-16-16','8-16-16','16-8-16'
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
    '1':4/4,
    '2':2/4,
    '4':1/4,
    '8':1/8,
    '16':1/16,
    '32':1/32,
    '64':1/64, 
    // 'd4-8':1/2 ,//1/4+1/8+1/8
    // 'd4-8-8':5/8,//1/4+1/8+2/8
    // 'd2':3/4, //2/4 +1/4,
    // '4-4':1/4,
    '16-16-16-16':1/4, // 4/16
    // '8-16-16':1/4, // 1/8+2/16=2/8=1/4
    // '16-8-16':1/4,
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
    VALOR_DE_NOTA
}