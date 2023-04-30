const dato = require('./constants');
const general = require('../Dictados_FuncGral/funcionesGenerales');
const validacion = require('../EscalasDiatonicas/validacion');

// Recibe nota = Fa## -> Devuelve Fa
const getNota = (nota) => {
    const nomDosChar = nota.substr(0, 2);
    const nomTresChar = nota.substr(0, 3);

    if (
        nomDosChar == 'Do' ||
        nomDosChar == 'Re' ||
        nomDosChar == 'Mi' ||
        nomDosChar == 'Fa' ||
        nomDosChar == 'La' ||
        nomDosChar == 'Si'
    ) {
        return nomDosChar;
    } else if (nomTresChar == 'Sol') {
        return nomTresChar;
    } else {
        general.printError('Variable tonalidad mal ingresada: ' + nota);
    }
};

// Recbie nota = Fa## -> Devuelve ##
// Recibe nota = FA4 -> Devuelve 4
const getAlteraciones = (nota) => {
    const nomDosChar = nota.substr(0, 2);
    const alteracionesDosChar = nota.substr(2);

    const nomTresChar = nota.substr(0, 3);
    const alteracionesTresChar = nota.substr(3);

    if (
        nomDosChar == 'Do' ||
        nomDosChar == 'Re' ||
        nomDosChar == 'Mi' ||
        nomDosChar == 'Fa' ||
        nomDosChar == 'La' ||
        nomDosChar == 'Si'
    ) {
        return alteracionesDosChar;
    } else if (nomTresChar == 'Sol') {
        return alteracionesTresChar;
    } else {
        general.printError(
            'Variable mal ingresada (function getAlteraciones = (nota)): ' +
                nota
        );
    }
};

// Recibe nota = Fa##, char = # -> Devuelve 2
const getNroApariciones = (nota, char) => {
    var indices = [];
    for (var i = 0; i < nota.length; i++) {
        if (nota[i] === char) {
            indices.push(i);
        }
    }
    return indices.length;
};

// Recibe nota = Fa##, alteraciones = # -> Devuelve Fa###
const alterar = (nota, alteraciones) => {
    const nroBmol = getNroApariciones(nota, 'b');
    const nroSostenido = getNroApariciones(nota, '#');

    const nroBmolAlteraciones = getNroApariciones(alteraciones, 'b');
    const nroSostenidoAlteraciones = getNroApariciones(alteraciones, '#');

    var notaRes;

    if (nroBmol > 0) {
        if (nroSostenidoAlteraciones > 0) {
            notaRes = nota.slice(0, -1).concat('v'); // becuadro representado con v
        } else {
            notaRes = nota.concat(alteraciones);
        }
    } else if (nroSostenido > 0) {
        if (nroBmolAlteraciones > 0) {
            notaRes = nota.slice(0, -1).concat('v'); // becuadro representado con v
        } else {
            notaRes = nota.concat(alteraciones);
        }
    } else {
        notaRes = nota.concat(alteraciones);
    }

    return notaRes;
};

// A partir de las notas basicas cuenta cuantas notas hay involucradas
const getNroNotasInvolucradas = (notaIni, notaFin) => {
    const notasBase = dato.NOTAS_BASICAS;
    const i_ini = notasBase.indexOf(notaIni);
    const i_fin = notasBase.indexOf(notaFin);

    if (i_ini <= i_fin) {
        return i_fin - i_ini + 1;
    } else {
        return notasBase.length - i_ini + (i_fin + 1);
    }
};

// ej de nota = 'Do4'
const getNotaTransformada = (nota, nroMov) => {
    const alteracionesSostenido = nota.match(/#/g) || []
    const alteracionesBmol = nota.match(/b/g) || []
    let nuevaNota = nota
    if (alteracionesSostenido.length) {
        nuevaNota = nuevaNota.replaceAll('#', '')
    }
    if (alteracionesBmol.length) {
        nuevaNota = nuevaNota.replaceAll('b', '')
    }
    
    // nuevaNota es del tipo Do4 or C4 (sin ateraciones)
    var numNota = parseInt(nuevaNota.slice(-1));
    const nombreNota = nuevaNota.slice(0, -1);

    if (!numNota) {
        general.printError(
            'Error alguna nota de las indicadas como notas de configuración'
        );
        return;
    }

    const notasBase = dato.NOTAS_BASICAS;
    const i_origin = notasBase.indexOf(nombreNota);

    const i_tarns = (i_origin + nroMov + notasBase.length) % notasBase.length;

    if ((i_origin + nroMov) / notasBase.length >= 1) {
        numNota++;
    }
    if (i_origin < i_tarns && nroMov < 0) {
        numNota--;
    }

    if (alteracionesSostenido.length && alteracionesBmol.length) {
        console.log('hay alteraciones # y b');
        console.log(nota);
    }

    if (alteracionesSostenido.length || alteracionesBmol.length) {
        // Existe alteracion
        if (nota.slice(-1) == '#' || nota.slice(-1) == 'b') {
            // Alteraciones al final (Do4#)
            return notasBase[i_tarns].concat(numNota.toString(), alteracionesSostenido.join(''), alteracionesBmol.join(''));
        } else {
            // Alteraciones entre nota y altura (C#4)
            return notasBase[i_tarns].concat(alteracionesSostenido.join(''), alteracionesBmol.join(''), numNota.toString());
        }
    } else {
        // No Existe alteracion
        return notasBase[i_tarns].concat(numNota.toString());
    }
};

const removeAlteraciones = (nota) => {
    const i_sostenido = nota.indexOf('#');
    const i_bmol = nota.indexOf('b');
    var notaRet = nota;
    if (i_sostenido > -1) {
        notaRet = nota.slice(0, i_sostenido);
    }

    if (i_bmol > -1) {
        notaRet = nota.slice(0, i_bmol);
    }

    return notaRet;
};

const getAlteracionEscalaDiatonica = (nota, escala) => {
    var alteracion = '';
    escala.forEach((notaDiatonica) => {
        const nombreNotaDiatonica = getNota(notaDiatonica);
        if (nota == nombreNotaDiatonica) {
            alteracion = getAlteraciones(notaDiatonica);
        }
    });

    return alteracion;
};

const aplicarAlteraciones = (notas, tonalidad) => {
    var notasTransformadas = [];

    const escalaDiatonica = validacion.calcularDiatonicaMayorMenor(
        tonalidad,
        'M'
    );

    notas.forEach((nota) => {
        const notaNomre = getNota(nota);
        const alteracion = getAlteracionEscalaDiatonica(
            notaNomre,
            escalaDiatonica
        );
        if (alteracion) {
            const notaTransformada = alterar(nota, alteracion);
            notasTransformadas.push(notaTransformada);
        } else {
            notasTransformadas.push(nota);
        }
    });

    return notasTransformadas;
};

// Pasa cada nota en 'notas' a la escala diatónica 'tonalidad'
// Ej de notas = ['Sol4', 'La4', 'Si4', 'Do5', 'Re5', 'Mi5', 'Fa#5', 'Sol5'],
const transformarAEscalaDiatonica = (notas, tonalidad) => {
    const tonalidadBase = getNota(tonalidad);
    const nroInvolucrados = getNroNotasInvolucradas('Do', tonalidadBase);

    var nroMovimiento = 0;
    nroInvolucrados > 5
        ? (nroMovimiento = nroInvolucrados - 8)
        : (nroMovimiento = nroInvolucrados - 1);

    var notasMovidas = [];

    notas.forEach((nota) => {
        const notaTrans = getNotaTransformada(nota, nroMovimiento);
        notasMovidas.push(notaTrans);
    });

    // Aplicar alteraciones dependiendo de la escala diatónica
    // const notasTransformadas = aplicarAlteraciones(notasMovidas, tonalidad);

    const notasTransformadas = notasMovidas;

    return notasTransformadas;
};

const transformarNotasAEscalaDiatonica = (conjuntoNotas, escalaDiatonica) => {
    var notasTransformadas = [];

    conjuntoNotas.forEach((notas) => {
        notasTransformadas.push(
            transformarAEscalaDiatonica(notas, escalaDiatonica)
        );
    });

    return notasTransformadas;
};

const desestructurarNota = (nota) => {
    const num_alt = getAlteraciones(nota);
    const altura = parseInt(num_alt.slice(0, 1));
    const alteracion = num_alt.slice(1, num_alt.length);
    const nombreNota = getNota(nota);

    return { nombreNota: nombreNota, altura: altura, alteracion: alteracion };
};

// notasConfig -> las notas tienen que venir con altura ej: Do4
const getMenorMayor = (notasConfig) => {
    var menorAltura = 99;
    var notaMenor = null;
    var mayorAltura = -1;
    var notaMayor = null;

    notasConfig.forEach((notas) => {
        notas.forEach((nota) => {
            // desestructurar nota
            const notaDeses = desestructurarNota(nota);

            if (parseInt(notaDeses.altura) < menorAltura) {
                menorAltura = parseInt(notaDeses.altura);
                notaMenor = notaDeses.nombreNota + notaDeses.altura.toString();
            }
            if (parseInt(notaDeses.altura) > mayorAltura) {
                mayorAltura = parseInt(notaDeses.altura);
                notaMayor = notaDeses.nombreNota + notaDeses.altura.toString();
            }
        });
    });

    return [notaMenor, notaMayor];
};

// A todas las notas de notasCongig las mueve mov alturas (ej mov = -1 de Do4 a Do3)
const modificarAlturaNotas = (notasConfig, mov) => {
    var notasConfigRes = [];
    notasConfig.forEach((notas) => {
        var notasRes = [];
        notas.forEach((nota) => {
            const notaDeses = desestructurarNota(nota);
            const nuevaAltura = (parseInt(notaDeses.altura) + mov).toString();
            const notaRes =
                notaDeses.nombreNota + nuevaAltura + notaDeses.alteracion;

            notasRes.push(notaRes);
        });
        notasConfigRes.push(notasRes);
    });

    return notasConfigRes;
};

const cuantasModificar = (notasConfig, notaMenor, notaMayor) => {
    var modificarAltura = 0;
    var ok = false;
    var imposible = false;
    var direccionSube = null;
    var notasRes = notasConfig;

    do {
        const menorMayor = getMenorMayor(notasRes);
        const menor = menorMayor[0];
        const mayor = menorMayor[1];
        const i_menor = dato.NOTAS_ALTURA.indexOf(menor);
        const i_notaMenorDato = dato.NOTAS_ALTURA.indexOf(notaMenor);
        const i_mayor = dato.NOTAS_ALTURA.indexOf(mayor);
        const i_notaMayorDato = dato.NOTAS_ALTURA.indexOf(notaMayor);

        ok = i_menor >= i_notaMenorDato && i_mayor <= i_notaMayorDato;
        imposible = i_menor < i_notaMenorDato && i_mayor > i_notaMayorDato;

        if (!imposible && !ok) {
            if (
                i_menor < i_notaMenorDato &&
                (direccionSube == null || direccionSube)
            ) {
                direccionSube = true;
                notasRes = modificarAlturaNotas(notasRes, 1); // ...
                modificarAltura++;
            } else if (
                i_mayor > i_notaMayorDato &&
                (direccionSube == null || !direccionSube)
            ) {
                direccionSube = false;
                notasRes = modificarAlturaNotas(notasRes, -1); // ...
                modificarAltura--;
            } else {
                imposible = true;
            }
        }
    } while (!ok && !imposible);

    if (imposible) return null;

    return modificarAltura;
};

// const pasarNotasAClave = (notasConfig, prioridadClave) => {
//     const pasarAFa = (notas) => {
//         var notasDesestructurada = [];
//         var menorAltura = -1;
//         notas.forEach((nota) => {
//             const num_alt = getAlteraciones(nota);

//             const altura = parseInt(num_alt.slice(0, 1));
//             const alteracion = num_alt.slice(1, num_alt.length);
//             const nombreNota = getNota(nota);

//             if (menorAltura < altura) {
//                 menorAltura = altura;
//             }

//             notasDesestructurada.push({
//                 altura: altura,
//                 alteracion: alteracion,
//                 nombreNota: nombreNota,
//             });
//         });

//         const restar = menorAltura - 2;
//     };

//     var claves = [];
//     prioridadClave.forEach((prioridad) => {
//         if (prioridad.clave == 'Sol') {
//             for (let i = 0; i < prioridad.prioridad; i++) {
//                 claves.push('Sol');
//             }
//         }

//         if (prioridad.clave == 'Fa') {
//             for (let i = 0; i < prioridad.prioridad; i++) {
//                 claves.push('Fa');
//             }
//         }
//     });

//     var notasConfigResult = notasConfig;
//     if (general.getRandom(claves) == 'Fa') {
//         notasConfigResult = pasarAFa(notasConfig);
//     }

//     return notasConfigResult;
// };

module.exports = {
    transformarAEscalaDiatonica,
    transformarNotasAEscalaDiatonica,
    cuantasModificar,
    modificarAlturaNotas,
    getNota,
    getAlteraciones,
    getNotaTransformada,
};
