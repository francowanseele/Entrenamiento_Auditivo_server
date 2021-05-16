const transformar = require('./DictadosMelodicos/transformarEscala');

const translateNotes = (dictado) => {
    var dictado_Trans = [];
    dictado.forEach((nota) => {
        const num_alt = transformar.getAlteraciones(nota);

        const altura = parseInt(num_alt.slice(0, 1));
        const alteracion = num_alt.slice(1, num_alt.length);
        const nombreNota = transformar.getNota(nota);

        if (altura && altura < 7 && altura > 0) {
            var nombreNota_Trans = null;
            switch (nombreNota) {
                case 'La':
                    nombreNota_Trans = 'A';
                    break;
                case 'Si':
                    nombreNota_Trans = 'B';
                    break;
                case 'Do':
                    nombreNota_Trans = 'C';
                    break;
                case 'Re':
                    nombreNota_Trans = 'D';
                    break;
                case 'Mi':
                    nombreNota_Trans = 'E';
                    break;
                case 'Fa':
                    nombreNota_Trans = 'F';
                    break;
                case 'Sol':
                    nombreNota_Trans = 'G';
                    break;
                default:
                    return null;
            }

            const notaTranslate =
                nombreNota_Trans + alteracion + altura.toString();
            dictado_Trans.push(notaTranslate);
        } else {
            return null;
        }
    });

    return dictado_Trans;
};

module.exports = {
    translateNotes,
};
