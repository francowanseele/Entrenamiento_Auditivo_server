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
const getNotasValidas = (nota, notasConfig) => {
    var notasValidas = [];
    notasConfig.forEach((notas) => {
        var indices = [];
        var idx = notas.indexOf(nota);
        while (idx != -1) {
            indices.push(idx);
            idx = notas.indexOf(nota, idx + 1);
        }

        indices.forEach((i) => {
            var notaAnterior = notas[i - 1];
            var notaPosterior = notas[i + 1];

            notaAnterior && notasValidas.push(notaAnterior);
            notaPosterior && notasValidas.push(notaPosterior);
        });
    });

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
        nivelPrioridad.forEach((prioridadRegla) => {
            if (prioridadRegla.regla == i) {
                prioridad = prioridadRegla.prioridad;
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

            if (notaAnterior) {
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
const obtenerMovimientosCamino = (camino, notasConfig) => {
    var notas = [];
    camino.forEach((elem) => {
        const unCamino = getNotasValidas(elem.nota, notasConfig);
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
    largoCamino
) => {
    if (largoCamino != null || cantRec < 75) {
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
            const movimientos = obtenerMovimientosCamino(camino, notasConfig);
            var notas = finalizarDictado(
                movimientos,
                notaFin,
                cantRec + 1,
                notasConfig,
                largoCamino
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
            'Error en "finalizarDictado", camino a la nota fin no encontrada'
        );
    }
};

// Elige una nota de 'faltantes' con prioridad las que estén a mayor distancia de 'notaBase'
const elegirFaltante = (faltantes, notasConfig, notaBase) => {
    const distancia = (notaRef, notasDestino, notasConfiguracion) => {
        var distancias = [];
        notasDestino.forEach((notaFin) => {
            const camino = finalizarDictado(
                [{ nota: notaRef, padre: null }],
                notaFin,
                0,
                notasConfiguracion,
                null
            );

            distancias.push([notaFin, camino.length]);
        });

        return distancias;
    };

    // retorna un arreglo y cada elemento es una tupla
    // 1º elem de la tupla dice la nota final y 2º dice la distancia de ese elemento a notaBase
    const dist = distancia(notaBase, faltantes, notasConfig);

    var elemsConProbabilidad = [];
    dist.forEach((elem) => {
        for (let i = 0; i < elem[1]; i++) {
            elemsConProbabilidad.push(elem[0]);
        }
    });

    return general.getRandom(elemsConProbabilidad);
};

// Retorna 'dictado' modificado de tal forma que termine en la nota 'notaFin'
const finalizarEnNota = (dictado, notaFin, notasConfig) => {
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
            largoCamino
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

    var notaRef = notaBase;
    var dictado = [];
    dictado.push(notaRef);

    if (pertenece(notaRef, notasConfig)) {
        var faltantes = [];
        faltantes = notasFaltantes(notasObligatorias, dictado);

        // Agrego al dictado las notas faltantes
        do {
            const notaDestino = elegirFaltante(faltantes, notasConfig, notaRef);

            const dictadoParcial = finalizarDictado(
                [{ nota: notaRef, padre: null }],
                notaDestino,
                0,
                notasConfig,
                null
            );
            dictado = concatenarDictado(dictado, dictadoParcial);

            notaRef = dictado[dictado.length - 1];

            faltantes = notasFaltantes(notasObligatorias, dictado);
        } while (faltantes.length >= 1 && dictado.length <= largoDictado);

        // Control para verificar que no se pasa del largo
        if (dictado.length > largoDictado) {
            if (cantRec < 75) {
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
                general.printError('El largo del dictado debería ser mayor');
                return dictado;
            }
        }

        // Completo el dictado
        while (dictado.length < largoDictado) {
            var notasValidas = getNotasValidasConPrioridad(
                notaRef,
                notasConfig,
                nivelPrioridad
            );
            var nota = general.getRandom(notasValidas); // Obtener random dando mayor probabilidad a una de las reglas
            dictado.push(nota);
            notaRef = nota;
        }

        // Coregir para que termine en notaFin
        // const dictadoFinEnNota = finalizarEnNota(dictado, notaFin, notasConfig);
        const dictadoFinEnNota = dictado;
        if (dictadoFinEnNota != null) {
            dictado = dictadoFinEnNota;
        } else {
            general.printError('No se finalizar el dictado en ' + notaFin);
        }
    } else {
        console.log('------------------------------');
        console.log('Error de entrada de datos');
        console.log('------------------------------');
    }

    return dictado;
};

module.exports = {
    generarDictado,
};
