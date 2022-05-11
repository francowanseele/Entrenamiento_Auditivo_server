const Compas = require('../models/compas');
const db = require('../data/knex');

function addCompas(req, res) {
    try {
        const { numerador, denominador, simple } = req.body;

        res.status(200).send({
            ok: true,
            compas: [],
            message: 'Compás creado correctamente',
        });

        // const compas = new Compas();
        // compas.numerador = numerador;
        // compas.denominador = denominador;
        // compas.simple = simple;

        // compas.save((err, newCompas) => {
        //     if (err) {
        //         res.status(500).send({
        //             ok: false,
        //             message: 'Error en el servidor',
        //         });
        //     } else if (!newCompas) {
        //         res.status(404).send({
        //             ok: false,
        //             message: 'Error al crear un nuevo Compás',
        //         });
        //     } else {
        //         res.status(200).send({
        //             ok: true,
        //             compas: newCompas,
        //             message: 'Compás creado correctamente',
        //         });
        //     }
        // });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getCompas(req, res) {
    try {
        const { simple } = req.params;

        const compases = await db
            .knex('Compas')
            .where({ Simple: simple })
            .select('Compas.id', 'Compas.Nombre', 'Compas.Simple');

        let result = [];
        compases.forEach((compas) => {
            const numDen = compas.Nombre.split('/');
            result.push({
                id: compas.id,
                Simple: compas.Simple,
                Numerador: parseInt(numDen[0]),
                Denominador: parseInt(numDen[1]),
            });
        });

        res.status(200).send({
            ok: true,
            compases: result,
            message: 'Ok',
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
    getCompas,
};
