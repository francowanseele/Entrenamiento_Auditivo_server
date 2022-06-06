const general = require('../Dictados_FuncGral/funcionesGenerales');

const pertenece = (nota, notasConfig) => {
    var pertenece = false;
    for (let i = 0; i < notasConfig.length && !pertenece; i++) {
        const notas = notasConfig[i];
        pertenece = notas.indexOf(nota) != -1;
    }
    return pertenece;
};

// Devuelve un arreglo de posibles movimientos a partir de 'nota'
const getNotasValidas = (nota, notasConfig, nivelPrioridad) => {
    var notasValidas = [];
    for (let i = 0; i < notasConfig.length; i++) {
        const notas = notasConfig[i];

        var lecturaAmbasDirecciones = false;
        nivelPrioridad.forEach((prioridadRegla) => {
            if (prioridadRegla.regla == i) {
                lecturaAmbasDirecciones = prioridadRegla.lecturaAmbasDirecciones
                    ? true
                    : false;
            }
        });

        var indices = [];
        var idx = notas.indexOf(nota);
        while (idx != -1) {
            indices.push(idx);
            idx = notas.indexOf(nota, idx + 1);
        }

        indices.forEach((i) => {
            var notaAnterior = notas[i - 1];
            var notaPosterior = notas[i + 1];

            notaAnterior &&
                lecturaAmbasDirecciones &&
                notasValidas.push(notaAnterior);
            notaPosterior && notasValidas.push(notaPosterior);
        });
    }

    return notasValidas;
};

// Devuelve las notas válidas de nota
// y las inserta la canitdad de veces según la prioridad de la regla
const getNotasValidasConPrioridad = (nota, notasConfig, nivelPrioridad) => {
    const agregarConPrioridad = (notas, nota, value) => {
        var notasRes = notas;
        for (let i = 0; i < value; i++) {
            notasRes.push(nota);
        }

        return notasRes;
    };
    var notasValidas = [];
    for (let i = 0; i < notasConfig.length; i++) {
        const notas = notasConfig[i];

        // Defino la prioridad por regla
        var prioridad = 1;
        var lecturaAmbasDirecciones = false;
        nivelPrioridad.forEach((prioridadRegla) => {
            if (prioridadRegla.regla == i) {
                prioridad = prioridadRegla.prioridad;
                lecturaAmbasDirecciones = prioridadRegla.lecturaAmbasDirecciones
                    ? true
                    : false;
            }
        });

        // Busco en notas config
        var indices = [];
        var idx = notas.indexOf(nota);
        while (idx != -1) {
            indices.push(idx);
            idx = notas.indexOf(nota, idx + 1);
        }

        // Para cada nota valida la agrego con su respectiva prioridad
        indices.forEach((i) => {
            var notaAnterior = notas[i - 1];
            var notaPosterior = notas[i + 1];

            if (notaAnterior && lecturaAmbasDirecciones) {
                notasValidas = agregarConPrioridad(
                    notasValidas,
                    notaAnterior,
                    prioridad
                );
            }
            if (notaPosterior) {
                notasValidas = agregarConPrioridad(
                    notasValidas,
                    notaPosterior,
                    prioridad
                );
            }
        });
    }

    return notasValidas;
};

// Obtiene movimientos válidos para cada una de las notas pertenecientes a 'camino'
const obtenerMovimientosCamino = (camino, notasConfig, nivelPrioridad) => {
    var notas = [];
    camino.forEach((elem) => {
        const unCamino = getNotasValidas(
            elem.nota,
            notasConfig,
            nivelPrioridad
        );
        unCamino.forEach((notaMov) => {
            notas.push({ nota: notaMov, padre: elem.nota });
        });
    });

    return notas;
};

// Encuentra el camino más corto desde camino.nota hasta nofaFin
// camino = [{ nota: notaInicio, padre: null }],
// notaFin,
// cantRec = 0 -> cantidad de recurciones,
// notasConfig
const finalizarDictado = (
    camino,
    notaFin,
    cantRec,
    notasConfig,
    largoCamino,
    nivelPrioridad
) => {
    if (largoCamino != null && cantRec < 10) {
        var elemEncontrado = [];
        for (let i = 0; i < camino.length && elemEncontrado.length == 0; i++) {
            const elem = camino[i];
            if (
                (largoCamino == null || cantRec == largoCamino) &&
                elem.nota == notaFin
            ) {
                elemEncontrado.push(elem);
            } else if (largoCamino != null && cantRec > largoCamino) {
                return null;
            }
        }

        if (elemEncontrado.length != 0) {
            return elemEncontrado;
        } else {
            const movimientos = obtenerMovimientosCamino(
                camino,
                notasConfig,
                nivelPrioridad
            );
            var notas = finalizarDictado(
                movimientos,
                notaFin,
                cantRec + 1,
                notasConfig,
                largoCamino,
                nivelPrioridad
            );
            if (notas == null) {
                return null;
            }
            const nota = notas[0];
            var elemActual = null;
            var elementos = [];
            for (let i = 0; i < camino.length && elemActual == null; i++) {
                const elem = camino[i];
                if (nota) {
                    if (elem.nota == nota.padre) {
                        elemActual = elem;
                    }
                }
            }

            elementos.push(elemActual);
            var ret = elementos.concat(notas);

            return ret;
        }
    } else {
        general.printError(
            'Function "finalizarDictado": camino a la nota fin no encontrada'
        );
    }
};

// Elige una nota de 'faltantes' con prioridad las que estén a mayor distancia de 'notaBase'
const elegirFaltante = (faltantes, notasConfig, notaBase, nivelPrioridad) => {
    const distancia = (
        notaRef,
        notasDestino,
        notasConfiguracion,
        nivelPrioridad
    ) => {
        var distancias = [];
        notasDestino.forEach((notaFin) => {
            const camino = finalizarDictado(
                [{ nota: notaRef, padre: null }],
                notaFin,
                0,
                notasConfiguracion,
                null,
                nivelPrioridad
            );

            distancias.push([notaFin, camino.length]);
        });

        return distancias;
    };

    // retorna un arreglo y cada elemento es una tupla
    // 1º elem de la tupla dice la nota final y 2º dice la distancia de ese elemento a notaBase
    const dist = distancia(notaBase, faltantes, notasConfig, nivelPrioridad);

    var elemsConProbabilidad = [];
    dist.forEach((elem) => {
        for (let i = 0; i < elem[1]; i++) {
            elemsConProbabilidad.push(elem[0]);
        }
    });

    return general.getRandom(elemsConProbabilidad);
};

// Retorna 'dictado' modificado de tal forma que termine en la nota 'notaFin'
const finalizarEnNota = (dictado, notaFin, notasConfig, nivelPrioridad) => {
    if (dictado[dictado.length - 1] == notaFin) {
        return dictado;
    }

    var dictadoParcial = null;
    var dictadoResult = null;
    for (let i = dictado.length - 2; i >= 0 && dictadoParcial == null; i--) {
        const nota = dictado[i];
        const largoCamino = dictado.length - 1 - i;
        dictadoParcial = finalizarDictado(
            [{ nota: nota, padre: null }],
            notaFin,
            0,
            notasConfig,
            largoCamino,
            nivelPrioridad
        );

        if (dictadoParcial != null) {
            dictadoResult = dictado.slice(0, i + 1);
            dictadoResult = concatenarDictado(dictadoResult, dictadoParcial);
        }
    }

    return dictadoResult;
};

// dictadoOriginal -> arreglo de notas
// dictadoParcial -> [nota: nota, padre: padre]
const concatenarDictado = (dictadoOriginal, dictadoParcial) => {
    var dictadoResult = dictadoOriginal;
    const notaRef = dictadoOriginal[dictadoOriginal.length - 1];
    if (dictadoParcial[0].nota == notaRef) {
        for (let i = 1; i < dictadoParcial.length; i++) {
            const notaFinal = dictadoParcial[i];
            dictadoResult.push(notaFinal.nota);
        }
    } else {
        general.printError('Falló función "finalizarDictado" ');
    }

    return dictadoResult;
};

// dictadoOriginal -> arreglo de notas
// dictadoParcial -> [nota: nota, padre: padre]
// CONTROL: si llega a nota fin en el largo estipulado devuelve ese dictado
const concatenarDictadoControlNotaFin = (
    dictado,
    dictadoParcial,
    largoDictado,
    notaFin,
    notasConfig,
    nivelPrioridad
) => {
    var dictadoRes = dictado;
    var encontreCamino = false;
    for (
        let i = 1;
        i < dictadoParcial.length &&
        !encontreCamino &&
        dictadoRes.length < largoDictado;
        i++
    ) {
        const notaAgregar = dictadoParcial[i].nota;
        const camino = finalizarDictado(
            [{ nota: dictadoRes[dictadoRes.length - 1], padre: null }],
            notaFin,
            0,
            notasConfig,
            null,
            nivelPrioridad
        );

        if (
            camino != null &&
            dictadoRes.length + camino.length - 1 == largoDictado
        ) {
            for (let i = 1; i < camino.length; i++) {
                const n = camino[i];
                dictadoRes.push(n.nota);
            }
            encontreCamino = true;
        } else {
            dictadoRes.push(notaAgregar);
        }
    }

    return dictadoRes;
};

// Se fija si dictado puede terminar en notaFin en el largo largoDictado
const terminarEnNota = (
    dictado,
    largoDictado,
    notasConfig,
    notaFin,
    nivelPrioridad
) => {
    var dictadoRes = dictado;
    const camino = finalizarDictado(
        [{ nota: dictado[dictado.length - 1], padre: null }],
        notaFin,
        0,
        notasConfig,
        null,
        nivelPrioridad
    );

    if (camino != null && dictado.length + camino.length - 1 == largoDictado) {
        for (let i = 1; i < camino.length; i++) {
            const n = camino[i];
            dictadoRes.push(n.nota);
        }
        return [true, dictadoRes];
    } else {
        return [false, null];
    }
};

const generarDictado = (
    notasConfig,
    notaBase,
    notaFin,
    largoDictado,
    notasObligatorias,
    nivelPrioridad,
    cantRec
) => {
    // conjNotasObligatorias es del tipo "arreglo de arreglo de notas" (idem a notasConfig)
    // Devuelve las notas que están en notasObligatorias y no en notas
    const notasFaltantes = (conjNotasObligatorias, notas) => {
        var faltantes = [];
        conjNotasObligatorias.forEach((notasObligatorias) => {
            notasObligatorias.forEach((notaOb) => {
                if (notas.indexOf(notaOb) == -1) {
                    faltantes.push(notaOb);
                }
            });
        });

        return faltantes;
    };

    try {
        var notaRef = notaBase;
        var dictado = [];
        dictado.push(notaRef);

        if (pertenece(notaRef, notasConfig)) {
            var faltantes = [];
            faltantes = notasFaltantes(notasObligatorias, dictado);

            // Agrego al dictado las notas faltantes
            // -------------------------------------
            // TODO: COMENTADO -> definir si dejarlo o no
            // -------------------------------------
            /*
        if (elegirFaltante(faltantes, notasConfig, notaRef, nivelPrioridad) != null) {
            // No entra en el if en caso de que en los giros melódicos solamente haya una única nota
            do {
                const notaDestino = elegirFaltante(
                    faltantes,
                    notasConfig,
                    notaRef,
                    nivelPrioridad
                );

                const dictadoParcial = finalizarDictado(
                    [{ nota: notaRef, padre: null }],
                    notaDestino,
                    0,
                    notasConfig,
                    null,
                    nivelPrioridad
                );

                dictado = concatenarDictadoControlNotaFin(
                    dictado,
                    dictadoParcial,
                    largoDictado,
                    notaFin,
                    notasConfig,
                    nivelPrioridad
                );
                // dictado = concatenarDictado(dictado, dictadoParcial);
                notaRef = dictado[dictado.length - 1];

                faltantes = notasFaltantes(notasObligatorias, dictado);
            } while (faltantes.length >= 1 && dictado.length < largoDictado);
        }
        */

            // Control para verificar que no se pasa del largo
            if (dictado.length > largoDictado) {
                if (cantRec < 35) {
                    // cantidad de intentos
                    return generarDictado(
                        notasConfig,
                        notaBase,
                        notaFin,
                        largoDictado,
                        notasObligatorias,
                        nivelPrioridad,
                        cantRec + 1
                    );
                } else {
                    // general.printError('El largo del dictado debería ser mayor');
                    return null;
                }
            }

            // Completo el dictado
            while (dictado.length < largoDictado) {
                const concat = terminarEnNota(
                    dictado,
                    largoDictado,
                    notasConfig,
                    notaFin,
                    nivelPrioridad
                );

                if (concat[0]) {
                    dictado = concat[1];
                } else {
                    var notasValidas = getNotasValidasConPrioridad(
                        notaRef,
                        notasConfig,
                        nivelPrioridad
                    );
                    var nota = general.getRandom(notasValidas); // Obtener random dando mayor probabilidad a una de las reglas
                    dictado.push(nota);
                    notaRef = nota;
                }
            }

            const dictadoFinEnNota = finalizarEnNota(
                dictado,
                notaFin,
                notasConfig,
                nivelPrioridad
            );

            if (
                dictadoFinEnNota != null &&
                dictadoFinEnNota[dictadoFinEnNota.length - 1] == notaFin &&
                dictadoFinEnNota.length == largoDictado
            ) {
                dictado = dictadoFinEnNota;
                return dictado;
            } else {
                if (cantRec < 25) {
                    // cantidad de intentos
                    return generarDictado(
                        notasConfig,
                        notaBase,
                        notaFin,
                        largoDictado,
                        notasObligatorias,
                        nivelPrioridad,
                        cantRec + 1
                    );
                } else {
                    // general.printError('No se finalizar el dictado en ' + notaFin);
                    return null;
                }
            }
        } else {
            console.log('------------------------------');
            console.log('Error de entrada de datos');
            console.log('------------------------------');
        }

        return dictado;
    } catch (error) {
        console.log('Error ------ Generar Dictado');
        console.log(error);
        return null;
    }
};

module.exports = {
    generarDictado,
};

// console.log(
//     generarDictado(
//         [
//             ['Si4', 'Do5', 'Re4', 'Mi4', 'Fa4', 'Sol4', 'La4'],
//             ['Si4', 'Re4', 'Do5'],
//             ['Do5', 'Mi4', 'Re4'],
//         ],
//         'La4',
//         'La4',
//         4,
//         [
//             ['Re4', 'Mi4', 'Fa3', 'Sol3', 'La3', 'Si3', 'Do4'],
//             ['Re4', 'Fa3', 'Mi4'],
//             ['Mi4', 'Sol3', 'Fa3'],
//         ],
//         [
//             { regla: 0, prioridad: 1 },
//             { regla: 1, prioridad: 4 },
//             { regla: 2, prioridad: 4 },
//         ],
//         0
//     )
// );
