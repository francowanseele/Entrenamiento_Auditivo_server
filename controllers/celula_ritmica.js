const CelulaRitmica = require('../models/celula_ritmica');
const db = require('../data/knex');
const formatData = require('../services/formatData');

async function addCelulaRitmica(req, res) {
    try {
        const { figuras, simple, valor } = req.body;

        const celRitAdded = await db
            .knex('CelulaRitmica')
            .insert({
                Simple: simple,
                Valor: valor,
            })
            .returning(['id', 'Simple', 'Valor']);

        for (let i = 0; i < figuras.length; i++) {
            const fig = figuras[i];
            await db.knex('CelulaRitmica_Figura').insert({
                CelulaRitmicaId: celRitAdded[0].id,
                Figura: fig,
                Orden: i,
            });
        }

        res.status(200).send({
            ok: true,
            compas: celRitAdded,
            message: 'Célula rítmica creada correctamente',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getCelulaRitmica(req, res) {
    try {
        const { simple } = req.params;

        const celulasRitmicas = await db
            .knex('CelulaRitmica')
            .where({ 'CelulaRitmica.Simple': simple })
            .select(
                'CelulaRitmica.id',
                'CelulaRitmica.Valor',
                'CelulaRitmica_Figura.Figura',
                'CelulaRitmica_Figura.Orden',
                'CelulaRitmica.Simple'
            )
            .join(
                'CelulaRitmica_Figura',
                'CelulaRitmica_Figura.CelulaRitmicaId',
                '=',
                'CelulaRitmica.id'
            );

        let figuras = [];
        formatData.GroupByIdAndShortByOrder(celulasRitmicas).forEach((crs) => {
            let figura = '';
            for (let i = 0; i < crs.length; i++) {
                const cr = crs[i];
                if (i < crs.length - 1) {
                    figura = figura + cr.Figura + '-';
                } else {
                    figura = figura + cr.Figura;
                }
            }

            figuras.push({
                id: crs[0].id,
                figuras: figura,
                simple: crs[0].Simple,
                valor: crs[0].Valor,
            });
        });

        res.status(200).send({
            ok: true,
            celulaRitmica: figuras,
            message: 'Ok',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

function CreateCelulaRitmica(req,res) {
    try {
        const { figuras, simple, valor } = req.body;
        const celulaRitmica = new CelulaRitmica();
        celulaRitmica.figuras = figuras;
        celulaRitmica.simple = simple;
        celulaRitmica.valor = valor;
        console.log(req.body.file)
        // req.files.forEach((e) => {
        //     console.log(e.filename);
        //     });
        celulaRitmica.imagen = {
                data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                contentType: 'image/png'
        }

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

module.exports = {
    addCelulaRitmica,
    getCelulaRitmica,
    CreateCelulaRitmica,
};
