const gral = require('../services/Dictados_FuncGral/funcionesGenerales');
const cte_dictados = require('../services/DictadosMelodicos/constants');
const transformar = require('../services/DictadosMelodicos/transformarEscala');
const dictado = require('../services/DictadosMelodicos/generarDictado');
const dictadoRitmico = require('../services/DictadosRitmicos/generarDictadosRitmicos');

function melodicDictation(req, res) {
    try {
        const {
            notasRegla,
            nivelPrioridadRegla,
            intervaloNotas,
            notasBase,
            notasFin,
            nivelPrioridadClave,
            cantDictado,
        } = req.body;

        // Notas de comienzo y fin
        const notaBase = gral.getRandom(notasBase);
        const notaFin = gral.getRandom(notasFin);

        // Clave del dictado (Sol/Fa)
        const clave = gral.getElemPrioridad(nivelPrioridadClave);

        // Intervalo en el que se tiene que generar en dictado (entre notaMayor y notaMenor)
        var notaMayor = null;
        var notaMenor = null;
        intervaloNotas.forEach((intervalo) => {
            if (intervalo.clave == clave) {
                notaMenor = intervalo.notaMenor;
                notaMayor = intervalo.notaMayor;
            }
        });
        if (notaMenor == null || notaMayor == null) {
            res.status(400).send({
                ok: false,
                message:
                    'Error en establecer el intervalo (notaMenor y notaMayor).',
            });
            return;
        }

        var escalasDiatonicasDato = cte_dictados.ESCALAS_DIATONICAS;
        var notasTransformadas = []; // notasRegla transformadas a una escala diatónica
        var modificarAltura = null; // cuantas alturas debo modificar las notas para que entre dentro del intervalo

        // Pruebo transformar a las notas de configuración a diferentes escálas diatónicas
        // y ver si caen dentro del intervalo de notas dado
        do {
            var escalaDiatonicaRDM = gral.getRandom(escalasDiatonicasDato);
            notasTransformadas = transformar.transformarNotasAEscalaDiatonica(
                notasRegla,
                escalaDiatonicaRDM
            );

            modificarAltura = transformar.cuantasModificar(
                notasTransformadas,
                notaMenor,
                notaMayor
            );

            if (modificarAltura == null) {
                escalasDiatonicasDato = gral.removeItemFromArr(
                    escalasDiatonicasDato,
                    escalaDiatonicaRDM
                );
            }
        } while (modificarAltura == null && escalasDiatonicasDato.length > 0);

        // Muevo las notasRegla (notasTransformadas) para que caigan dentro del intervalo
        if (modificarAltura != null) {
            notasTransformadas = transformar.modificarAlturaNotas(
                notasTransformadas,
                modificarAltura
            );
        } else {
            res.status(400).send({
                ok: false,
                message:
                    'No se puede generar un dictado en el intervalo dado (notaMenor y notaMayor).',
            });
            return;
        }

        var notaBaseTransformada = transformar.transformarAEscalaDiatonica(
            [notaBase],
            escalaDiatonicaRDM
        )[0];
        var notaFinTransformada = transformar.transformarAEscalaDiatonica(
            [notaFin],
            escalaDiatonicaRDM
        )[0];

        // Muevo las nota base y fin dentro del intervalo
        notaBaseTransformada = transformar.modificarAlturaNotas(
            [[notaBaseTransformada]],
            modificarAltura
        )[0][0];
        notaFinTransformada = transformar.modificarAlturaNotas(
            [[notaFinTransformada]],
            modificarAltura
        )[0][0];

        const dictadoGenerado = dictado.generarDictado(
            notasTransformadas,
            notaBaseTransformada,
            notaFinTransformada,
            cantDictado,
            notasTransformadas,
            nivelPrioridadRegla,
            0
        );

        if (dictadoGenerado.length == 0) {
            res.status(400).send({
                ok: false,
                message: 'Dictado generado vacío',
            });
            return;
        }

        const configDictado = {
            notasRegla: notasRegla,
            notaInicio: notaBase,
            notaFin: notaFin,
            clave: clave,
            largo: cantDictado,
            escalaDiatonica: escalaDiatonicaRDM,
            notasRegla_Transform: notasTransformadas,
            notaInicio_Transform: notaBaseTransformada,
            notaFin_Transform: notaFinTransformada,
        };

        res.status(200).send({
            ok: true,
            message: 'Dictado generado correctamente',
            dictado: dictadoGenerado,
            configuracion: configDictado,
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

function rhythmicDictation(req, res) {
    try {
        const getFiguras = (dictado) => {
            var figuras = [];

            dictado.forEach((compas) => {
                compas.forEach((tarjeta) => {
                    const fgs = tarjeta.split('-');
                    fgs.forEach((fig) => {
                        figuras.push(fig);
                    });
                });
            });

            return figuras;
        };

        const { tarjetas, nroCompases, numerador, denominador } = req.body;

        var dictado = [];
        let dictadosValidos = dictadoRitmico.getFigurasValida(
            tarjetas,
            numerador,
            denominador
        );
        for (i = 0; i < nroCompases; i++) {
            dictado.push(gral.getRandom(dictadosValidos));
        }

        const figurasDictado = getFiguras(dictado);

        res.status(200).send({
            ok: true,
            figuras: figurasDictado,
            dictado: dictado,
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    melodicDictation,
    rhythmicDictation,
};
