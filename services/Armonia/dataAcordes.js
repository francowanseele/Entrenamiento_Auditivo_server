const acordes = [
    {
        name: 'C', // must be uniqe
        description: 'Do mayor',
        notas: ['C', 'E', 'G'],
        todasAparecen: true,
        estado: [
            {
                nombre: 'C',
                notaInferior: 'C',
                duplica: ['C', 'G'],
            },
            {
                nombre: 'C/E',
                notaInferior: 'E',
                duplica: ['C', 'G'],
            },
            {
                nombre: 'C/G',
                notaInferior: 'G',
                duplica: ['G'],
            },
        ],
    },
    {
        name: 'Cm', // must be uniqe
        description: 'Do menor',
        notas: ['C', 'Eb', 'G'],
        todasAparecen: true,
        estado: [
            {
                nombre: 'Cm',
                notaInferior: 'C',
                duplica: ['C', 'G'],
            },
            {
                nombre: 'Cm/Eb',
                notaInferior: 'Eb',
                duplica: ['C', 'G'],
            },
            {
                nombre: 'CmG',
                notaInferior: 'G',
                duplica: ['G'],
            },
        ],
    },
];

module.exports = {
    acordes,
};
