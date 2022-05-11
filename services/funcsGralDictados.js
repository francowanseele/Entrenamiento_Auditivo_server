const transformar = require('./DictadosMelodicos/transformarEscala');
const datoEscalaDiatonica = require('./EscalasDiatonicas/datos');

const translateNotes = (dictado) => {
    var dictado_Trans = [];
    dictado.forEach((nota) => {
        const num_alt = transformar.getAlteraciones(nota);

        const altura = parseInt(num_alt.slice(0, 1));
        var alteracion = null;
        if (num_alt.length > 1) {
            alteracion = num_alt.slice(1, num_alt.length);
        } else {
            alteracion = '';
        }

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

const translateToMyNotes = (dictado) => {
    var dictado_Trans = [];
    dictado.forEach((nota) => {
        const nombreNota = nota.slice(0, 1);
        var alteracion = null;
        if (nota.length > 2) {
            alteracion = nota.slice(1, nota.length - 1);
        } else {
            alteracion = '';
        }
        const altura = parseInt(nota.slice(-1));

        if (altura && altura < 7 && altura > 0) {
            var nombreNota_Trans = null;
            switch (nombreNota) {
                case 'A':
                    nombreNota_Trans = 'La';
                    break;
                case 'B':
                    nombreNota_Trans = 'Si';
                    break;
                case 'C':
                    nombreNota_Trans = 'Do';
                    break;
                case 'D':
                    nombreNota_Trans = 'Re';
                    break;
                case 'E':
                    nombreNota_Trans = 'Mi';
                    break;
                case 'F':
                    nombreNota_Trans = 'Fa';
                    break;
                case 'G':
                    nombreNota_Trans = 'Sol';
                    break;
                default:
                    return null;
            }

            const notaTranslate =
                nombreNota_Trans + altura.toString() + alteracion;
            dictado_Trans.push(notaTranslate);
        } else {
            return null;
        }
    });

    return dictado_Trans;
};

// formato de notas -> [C#4]
const applyTransformation = (notas, escala) => {
    var alteraciones = null;
    const alteracionesEscalaDiatonica =
        datoEscalaDiatonica.ALTERACIONES_ESCALA_DIATONICA;
    alteracionesEscalaDiatonica.forEach((alt_ED) => {
        if (alt_ED.escala == escala) {
            alteraciones = alt_ED.alteracion;
        }
    });

    if (alteraciones) {
        var res = [];
        notas.forEach((nota) => {
            const nombreNota = nota.slice(0, 1);
            var notaAlterada = nota;
            alteraciones.forEach((alt) => {
                const nombreAlt = alt.slice(0, 1);
                if (nombreNota == nombreAlt) {
                    notaAlterada = alt + nota.slice(1, nota.length);
                }
            });

            res.push(notaAlterada);
        });

        return res;
    } else {
        return null;
    }
};

// bpm = {menor: Number, mayor: Number}
const getBPMRandom = (bpm) => {
    const rdm = Math.floor(Math.random() * 10000 + 1); // nro random de 4 cifras
    const dif = Math.abs(bpm.mayor - bpm.menor + 1);

    if (bpm.mayor > bpm.menor) {
        return bpm.menor + (rdm % dif);
    } else {
        return bpm.mayor + (rdm % dif);
    }
};

// given a bpm, returns the time in seconds
const bpmToSec = (bpm) => {
    const sec = 60 / bpm;
    return parseFloat(sec.toFixed(4));
}

// given a figure (4, 8, d4..) and the time in seconds of negraSec
// returns time in second of fig
const translateFigToSec = (fig, negraSec) => {
    switch (fig.toString()) {
        case '1':
            return negraSec * 4;
        case '2':
            return negraSec * 2;
        case 'd2':
            return negraSec * 2 + negraSec * 1;
        case 'dd2':
            return negraSec * 2 + negraSec * 1 + negraSec / 2;
        case '4':
            return negraSec * 1;
        case 'd4':
            return negraSec * 1 + negraSec / 2;
        case 'dd4':
            return negraSec * 1 + negraSec / 2 + negraSec / 4;
        case '8':
            return negraSec / 2;
        case 'd8':
            return negraSec / 2 + negraSec / 4;
        case 'dd8':
            return negraSec / 2 + negraSec / 4 + negraSec / 8;
        case '16':
            return negraSec / 4;
        case '32':
            return negraSec / 8;
        case '64':
            return negraSec / 16;

        default:
            return null;
    }
};

// given a figurasDictado ([4, 8, 8, 16]) and the time in second of negraSec
// return a dictation with each figure in seconds
const translateDictadoFigToSec = (figurasDictado, negraSec) => {
    let dictadoSec = figurasDictado.map((fig) => {
        return translateFigToSec(fig, negraSec);
    }); 

    return dictadoSec;
}

// returns the time in seconds of the compas
const getCompasSec = (numerador, pulsoSec) => {
    return pulsoSec * numerador;
}

module.exports = {
    translateNotes,
    translateToMyNotes,
    applyTransformation,
    getBPMRandom,
    bpmToSec,
    translateDictadoFigToSec, 
    getCompasSec,
    translateFigToSec,
};
