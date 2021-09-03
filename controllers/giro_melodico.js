const GiroMelodico = require('../models/giro_melodico');

function addGiroMelodico(req, res) {
    try {
        const { giro_melodico, mayor } = req.body;

        const GM = new GiroMelodico();
        GM.notas = giro_melodico;
        GM.mayor = mayor;

        GM.save((err, newGM) => {
            if (err) {
                res.status(500).send({
                    ok: false,
                    message: 'Error en el servidor',
                });
            } else if (!newGM) {
                res.status(404).send({
                    ok: false,
                    message: 'Error al crear el Giro Melódico',
                });
            } else {
                res.status(200).send({
                    ok: true,
                    message: 'Giro Melódico creada correctamente',
                });
            }
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

function getGiroMelodico(req, res) {
    const { mayor } = req.body;
    try {
        GiroMelodico.find({ mayor: mayor }).exec(
            (err, girosMelodicosResult) => {
                if (err) {
                    res.status(500).send({
                        ok: false,
                        message: 'Error en el servidor',
                    });
                } else if (!girosMelodicosResult) {
                    res.status(404).send({
                        ok: false,
                        message: 'No se ha encontrado ningún Giro melódico',
                    });
                } else {
                    res.status(200).send({
                        ok: true,
                        girosMelodicos: girosMelodicosResult,
                        message: 'Ok',
                    });
                }
            }
        );
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    addGiroMelodico,
    getGiroMelodico,
};
