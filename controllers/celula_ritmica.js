const CelulaRitmica = require('../models/celula_ritmica');
const db = require('../data/knex');
const formatData = require('../services/formatData');
const fs = require('fs');
const dato = require('./../services/DictadosRitmicos/datosRitmicos');



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


async function CreateCelulaRitmica(req,res) {
    try {
        const { profileImage,valor,simple } = req.body;

        let valorTodb = 0; 
        valor.forEach((val)=>{
            valorTodb = valorTodb + dato.VALOR_DE_NOTA[val]
        })
        const celRitAdded = await db.knex('CelulaRitmica').insert({
                Simple: simple,
                Valor:valorTodb,
                Imagen: profileImage
            }).returning(['id', 'Simple', 'Valor']);

        valor.forEach(async (val,index)=>{
            await db.knex('CelulaRitmica_figura').insert({
                CelulaRitmicaId:celRitAdded[0].id,
                Figura:val,
                Orden:index,
            })
        })  

        res.status(200).send({
            ok: true,
            compas: celRitAdded,
            message: 'Célula rítmica creada correctamente',
        });
    } catch (error) {
        console.log(error)
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
