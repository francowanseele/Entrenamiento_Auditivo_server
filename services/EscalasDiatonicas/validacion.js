const dato = require('./datos');

// Cuenta numero de nombres distintos en la secuencia sec
function cantNombresDistintos(sec) {
    var nombres = [];
    sec.forEach((nota) => {
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
            if (!nombres.includes(nomDosChar)) {
                nombres.push(nomDosChar);
            }
        }
        if (nomTresChar === 'Sol') {
            if (!nombres.includes(nomTresChar)) {
                nombres.push(nomTresChar);
            }
        }
    });
    return nombres.length;
}

// nom es el nombre a sustituir por una nota equivalente
// direccion va a indicar si es ascendente o descendente
function sustituirNombre(nom, secuencia, direccion, masNombres) {
    const i = secuencia.indexOf(nom);
    if (i == -1) return null;

    if (masNombres) {
        const i_ant = (i - 1 + 12) % 12;
        if (direccion == dato.ASCENDENTE) {
            // secuencia[i] = secuencia[i_ant] + '#';
            return secuencia[i_ant] + '#';
        } else {
            // secuencia[i] = secuencia[i_ant] + 'b';
            return secuencia[i_ant] + 'b';
        }
    } else {
        const i_post = (i + 1) % 12;
        if (direccion == dato.ASCENDENTE) {
            return secuencia[i_post] + 'b';
        } else {
            return secuencia[i_post] + '#';
        }
    }
}

function sustituirPorNotaOriginal(nom) {
    const secuenciaOriginal = dato.SECUENCIA_ASCENDENTE;
    i = nom.indexOf('#');
    j = nom.indexOf('b');

    // Nota sin sostenido ni bmol
    var nota;
    // Cuenta cuantas alteraciones tiene (numero de '#' o 'b')
    var cantAlteraciones;
    // Indice de la nota 'nom' dentro de la secuencia original de notas
    var indNota;
    // Indice del equivalente de la nota 'nom'
    var indice;
    if (i != -1) {
        nota = nom.slice(0, i);
        cantAlteraciones = nom.slice(i, nom.length).length % 12; // sería igual a cantidad de ocurrecnias de '#'
        indNota = secuenciaOriginal.indexOf(nota);
        indice = (indNota + cantAlteraciones) % 12;
    } else if (j != -1) {
        nota = nom.slice(0, j);
        cantAlteraciones = nom.slice(j, nom.length).length % 12; // sería igual a cantidad de ocurrecnias de 'b'
        indNota = secuenciaOriginal.indexOf(nota);
        indice = (indNota - cantAlteraciones + 12) % 12;
    } else {
        // Nota mal escrita
        console.log('------------------------------------------');
        console.log('Nota root mal escrita');
        console.log('------------------------------------------');
    }

    return secuenciaOriginal[indice];
}

function verificarNumNombres(indRoot, indDest, secuencia, direccion) {
    var sec = []; // Secuencia de notas desde indRoot a indDest
    if (indRoot < indDest) {
        sec = secuencia.slice(indRoot, indDest + 1);
        nombresDistintos = cantNombresDistintos(sec);
    } else if (indRoot > indDest) {
        const sec_1 = secuencia.slice(indRoot, secuencia.length);
        const sec_2 = secuencia.slice(0, indDest + 1);
        sec = sec_1.concat(sec_2);
        nombresDistintos_1 = cantNombresDistintos(sec_1);
        nombresDistintos_2 = cantNombresDistintos(sec_2);
        nombresDistintos = nombresDistintos_1 + nombresDistintos_2;
    } else {
        nombresDistintos = 1;
    }

    var tupla = [];
    if (nombresDistintos == dato.REGLA_NUM_NOTAS) {
        tupla = [secuencia[indRoot], secuencia[indDest]];
    } else {
        const masNombres = nombresDistintos > dato.REGLA_NUM_NOTAS;
        tupla = [
            secuencia[indRoot],
            sustituirNombre(
                secuencia[indDest],
                secuencia,
                direccion,
                masNombres
            ),
        ];
        sec[sec.length - 1] = tupla[1];
    }

    // Verificar que el invervalo corresponde a la regla de cantidad de notas
    if (cantNombresDistintos(sec) !== dato.REGLA_NUM_NOTAS) {
    }

    return tupla;
}

function calcularIndicesCircular(nota, secuencia) {
    var root = nota;
    if (secuencia.indexOf(root) == -1) {
        // nota no pertenece a secuencia
        root = sustituirPorNotaOriginal(nota);
    }

    const indRoot = secuencia.indexOf(root);
    const indDest = (indRoot + dato.REGLA_AVANCE) % 12;

    return [indRoot, indDest];
}

// Calcula escala diatónica a paritr de la primer nota
function calcularDiatonica(root, secuencia, direccion) {
    var escalas = [];
    escalas.push(root);
    var nota1 = root;
    for (let i = 0; i < 6; i++) {
        var inds = calcularIndicesCircular(nota1, secuencia);
        const secuenciaAux = secuencia;
        secuenciaAux[inds[0]] = nota1;
        var notas = verificarNumNombres(
            inds[0],
            inds[1],
            secuenciaAux,
            direccion
        );
        escalas.push(notas[1]);
        nota1 = notas[1];
    }

    return escalas;
}

// Calcula escala diatónica indicando si Mayor o menor
function calcularDiatonicaMayorMenor(root, mayor) {
    var escalas = [];
    var iteraciones_izq;
    var iteraciones_der;
    if (mayor) {
        iteraciones_izq = 1;
        iteraciones_der = 5;
    } else {
        iteraciones_izq = 4;
        iteraciones_der = 2;
    }

    var nota1 = root;
    for (let i = 1; i <= iteraciones_izq; i++) {
        const inds = calcularIndicesCircular(nota1, dato.SECUENCIA_DESCENDENTE);
        const secuenciaAux = dato.SECUENCIA_DESCENDENTE;
        secuenciaAux[inds[0]] = nota1;
        const notas = verificarNumNombres(
            inds[0],
            inds[1],
            secuenciaAux,
            dato.DESCENDENTE
        );
        escalas.unshift(notas[1]);
        nota1 = notas[1];
    }
    escalas.push(root);
    nota1 = root;
    for (let j = 1; j <= iteraciones_der; j++) {
        const inds = calcularIndicesCircular(nota1, dato.SECUENCIA_ASCENDENTE);
        const secuenciaAux = dato.SECUENCIA_ASCENDENTE;
        secuenciaAux[inds[0]] = nota1;
        const notas = verificarNumNombres(
            inds[0],
            inds[1],
            secuenciaAux,
            dato.ASCENDENTE
        );
        escalas.push(notas[1]);
        nota1 = notas[1];
    }

    return escalas;
}

module.exports = {
    calcularDiatonicaMayorMenor,
    calcularDiatonica,
    cantNombresDistintos,
    sustituirNombre,
    sustituirPorNotaOriginal,
};
