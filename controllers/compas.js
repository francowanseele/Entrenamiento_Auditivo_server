const Compas = require('../models/compas');

function addCompas(req, res) {
    try {
        const { numerador, denominador } = req.body;

        const compas = new Compas();
        compas.numerador = numerador;
        compas.denominador = denominador;

        compas.save((err, newCompas) => {
            if (err) {
                res.status(500).send({
                    ok: false,
                    message: 'Error en el servidor',
                });
            } else if (!newCompas) {
                res.status(404).send({
                    ok: false,
                    message: 'Error al crear un nuevo Compás',
                });
            } else {
                res.status(200).send({
                    ok: true,
                    compas: newCompas,
                    message: 'Compás creado correctamente',
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
    addCompas,
};
