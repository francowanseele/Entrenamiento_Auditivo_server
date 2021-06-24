const GiroMelodico = require('../models/giro_melodico');

function addGiroMelodico(req, res) {
    try {
        const { giro_melodico } = req.body;

        const GM = new GiroMelodico();
        GM.notas = giro_melodico;

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

module.exports = {
    addGiroMelodico,
};
