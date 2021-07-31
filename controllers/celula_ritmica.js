const CelulaRitmica = require('../models/celula_ritmica');

function addCelulaRitmica(req, res) {
    try {
        const { figuras, simple, valor } = req.body;

        const celulaRitmica = new CelulaRitmica();
        celulaRitmica.figuras = figuras;
        celulaRitmica.simple = simple;
        celulaRitmica.valor = valor;

        celulaRitmica.save((err, newCelulaRitmica) => {
            if (err) {
                res.status(500).send({
                    ok: false,
                    message: 'Error en el servidor',
                });
            } else if (!newCelulaRitmica) {
                res.status(404).send({
                    ok: false,
                    message: 'Error al crear una nueva célula rítmica',
                });
            } else {
                res.status(200).send({
                    ok: true,
                    compas: newCelulaRitmica,
                    message: 'Célula rítmica creada correctamente',
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

function getCelulaRitmica(req, res) {
    try {
        const { simple } = req.params;

        CelulaRitmica.find({ simple: simple }).then((celulaRitmica) => {
            if (!celulaRitmica) {
                res.status(404).send({
                    ok: false,
                    message: 'No se han encontrado célula rítmica',
                });
            } else {
                res.status(200).send({
                    ok: true,
                    celulaRitmica: celulaRitmica,
                    message: 'Ok',
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

module.exports = {
    addCelulaRitmica,
    getCelulaRitmica,
};
