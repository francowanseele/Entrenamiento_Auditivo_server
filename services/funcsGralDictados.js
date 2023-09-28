const { Note } = require('@tonaljs/tonal');
const transformar = require('./DictadosMelodicos/transformarEscala');
const datoEscalaDiatonica = require('./EscalasDiatonicas/datos');
const datoEscalaDiatonicaAnglo = require('./EscalasDiatonicas/datosAngloSaxonNomenclature');

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
                    // if there is #b or b#, is like there is no alteracion
                    notaAlterada = notaAlterada.replaceAll('#b','')
                    notaAlterada = notaAlterada.replaceAll('b#','')
                }
            });

            res.push(notaAlterada);
        });

        return res;
    } else {
        return null;
    }
};

/**
 * se fija las alteraciones que tiene tonality y les saca dicha alteracion a notas.
 * 
 * @param {[string]} notas ex: ['A#3', 'Cb4']
 * @param {string} tonality ex: 'C' || 'Do'
 */
const unapplyTonality = (notas, tonality) => {
    const alteraciones = datoEscalaDiatonicaAnglo.ALTERACIONES_ESCALA_DIATONICA.find(
        (x) => x.escalaTraducida == tonality || x.escala == tonality
    ).alteracion

    let res = []
    notas.forEach(nota => {
        const infoNota = Note.get(nota)
        let newNote = nota
        alteraciones.forEach(alteracion => {
            const acc = Note.get(alteracion).acc
            const letter = Note.get(alteracion).letter
            
            if (infoNota.letter == letter && (infoNota.acc == 'b' || infoNota.acc == '#')) { // saco la alteracion si solo tiene UNA alteración
                // TODO: no solo reemplazar.. 
                //  if acc == b
                //      if nota tiene b
                //          nota.replace(acc, '')
                //      else
                //          nota aplicar #
                newNote = nota.replace(acc, '')
            } 
        });
        res.push(newNote)
    });

    return res
}

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
        case '1S':
            return negraSec * 4;
        case 'd1':
        case 'd1S':
            return negraSec * 4 + negraSec * 2;
        case '2':
        case '2S':
            return negraSec * 2;
        case 'd2':
        case 'd2S':
            return negraSec * 2 + negraSec * 1;
        case 'dd2':
        case 'dd2S':
            return negraSec * 2 + negraSec * 1 + negraSec / 2;
        case '4':
        case '4S':
            return negraSec * 1;
        case 'd4':
        case 'd4S':
            return negraSec * 1 + negraSec / 2;
        case 'dd4':
        case 'dd4S':
            return negraSec * 1 + negraSec / 2 + negraSec / 4;
        case '8':
        case '8S':
            return negraSec / 2;
        case 'd8':
        case 'd8S':
            return negraSec / 2 + negraSec / 4;
        case 'dd8':
        case 'dd8S':
            return negraSec / 2 + negraSec / 4 + negraSec / 8;
        case '16':
        case '16S':
            return negraSec / 4;
        case 'd16':
        case 'd16S':
            return negraSec / 4 + negraSec / 8;
        case '32':
        case '32S':
            return negraSec / 8;
        case '64':
        case '64S':
            return negraSec / 16;

        default:
            return null;
    }
};

// given a figurasDictado ([4, 8, 8, 16]) and the time in second of negraSec
// return a dictation with each figure in seconds
const translateDictadoFigToSec = (figurasDictado, negraSec) => {
    let dictadoSec = figurasDictado.map((fig) => {
        if (fig.indexOf('_') != -1) {
            // Check if fig has ligadura
            let resInSec = 0;
            const f = fig.split('_');
            f.forEach((fLigs) => {
                resInSec = resInSec + translateFigToSec(fLigs, negraSec);
            });

            return resInSec;
        } else {
            return translateFigToSec(fig, negraSec);
        }
    }); 

    return dictadoSec;
}

// returns the time in seconds of the compas
const getCompasSec = (numerador, pulsoSec) => {
    return pulsoSec * numerador;
}

/**
 * 
 * @param {string} tonality ex: Do
 * @return {string} ex C
 */
const translateTonality = (tonality) => {
    return datoEscalaDiatonicaAnglo.ALTERACIONES_ESCALA_DIATONICA.find(x => x.escalaTraducida == tonality)?.escala;
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
    translateTonality,
    unapplyTonality,
};
