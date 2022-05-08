const Usuario = require('../models/usuario');
const Curso = require('../models/curso');
const dictadoRitmico = require('../services/DictadosRitmicos/generarDictadosRitmicos');
const dictadoMelodico = require('../services/DictadosMelodicos/generarDictadosMelodicos');
const gral = require('../services/funcsGralDictados');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../data/knex');
const { GroupByIdAndShortByOrder } = require('../services/formatData');

const find = (arr, id) => {
    var exist = false;
    arr.forEach((elem) => {
        if (elem._id == id) {
            exist = true;
        }
    });

    return exist;
};

async function addUser(req, res) {
    try {
        const { name, lastname, email, password, isTeacher, idCoursePersonal } =
            req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const usrs = await db
            .knex('Usuario')
            .insert({
                Nombre: name,
                Apellido: lastname,
                Email: email.toLowerCase(),
                Password: hashedPassword,
                EsDocente: isTeacher,
                CursoPersonalId: idCoursePersonal,
            })
            .returning([
                'id',
                'Nombre',
                'Apellido',
                'Email',
                'EsDocente',
                'CursoPersonalId',
            ]);

        await db.knex('UsuarioCursa_Curso').insert({
            CursoId: idCoursePersonal,
            UsuarioId: usrs[0].id,
            FechaInscripcion: Date.now(),
        });

        res.status(200).send({
            ok: true,
            user: usrs[0],
            message: 'Usuario creado correctamente',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

// Obtener un usuario de la base a partir de su Correo y pass
//Datos de entrada: { email: '' , password: '' }
const obtenerUsuarioRegistrado = async (req, res) => {
    try {
        const { email, password, isTeacher } = req.body;

        const users = await db
            .knex('Usuario')
            .where({ Email: email.toLowerCase(), EsDocente: isTeacher })
            .select(
                'id',
                'Nombre',
                'Apellido',
                'Email',
                'Password',
                'EsDocente',
                'CursoPersonalId'
            );

        if (users.length == 1) {
            const usr = users[0];
            bcrypt.compare(password, usr.Password, function (err, resultPass) {
                if (resultPass) {
                    res.status(200).send({
                        ok: true,
                        personal_course: usr.CursoPersonalId,
                        id_user: usr.id,
                        name: usr.Nombre,
                        lastname: usr.Apellido,
                        email: usr.Email,
                        password: usr.Password,
                        esDocente: usr.EsDocente,
                        message: 'Usuario encontrado',
                    });
                } else {
                    res.status(404).send({
                        ok: false,
                        message: 'password incorrecta',
                    });
                }
            });
        } else {
            res.status(404).send({
                ok: false,
                message: 'No se ha encontrado el usuario',
            });
        }
    } catch (err) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
};

// En services/DictadosMelodicos/generarDictadosMelodicos.js
// se dice el formato de los datos de entrada,
// (cómo tienen que venir en el req.body)
async function generateDictation(req, res) {
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

        const translateNotasRegla = (notasRegla) => {
            var res = [];
            notasRegla.forEach((notas) => {
                res.push(gral.translateToMyNotes(notas));
            });

            return res;
        };

        const transalteIntervalo = (intervalo) => {
            var res = [];
            intervalo.forEach((elem) => {
                const notaMenor_trad = gral.translateToMyNotes([
                    elem.notaMenor,
                ]);
                const notaMayor_trad = gral.translateToMyNotes([
                    elem.notaMayor,
                ]);
                res.push({
                    clave: elem.clave,
                    notaMenor: notaMenor_trad[0],
                    notaMayor: notaMayor_trad[0],
                });
            });

            return res;
        };

        const getDictationsFilter = (dictados, idConfig) => {
            var res = [];
            dictados.forEach((d) => {
                if (d.configuracion_dictado == idConfig) {
                    res.push(d);
                }
            });

            return res;
        };

        const {
            tarjetas,
            nroCompases,
            compas,
            simple,
            notasRegla,
            nivelPrioridadRegla,
            intervaloNotas,
            notasBase,
            notasFin,
            nivelPrioridadClave,
            escalaDiatonicaRegla,
            notaBase,
            bpm,
            dictado_ritmico,
        } = req.body;
        const { id } = req.params;
        const { idConfigDictation, cantDictation, onlyValidation } = req.query;

        console.log(
            'acaaaa------------------------------------ Generate dictation'
        );
        console.log(req.body);
        console.log(req.params);
        console.log(req.query);

        // Translate to my notas cod (ex: Sol4)
        const notasRegla_trad = translateNotasRegla(notasRegla);
        const intervaloNotas_trad = transalteIntervalo(intervaloNotas);
        const notasBase_trad = gral.translateToMyNotes(notasBase);
        const notasFin_trad = gral.translateToMyNotes(notasFin);
        const notaReferencia_trad = gral.translateToMyNotes([notaBase])[0];

        var res_dictation = [];
        let dictationInsert = [];
        let dictationNoteInsert = [];
        let dictationCRInsert = [];
        const nroDic = parseInt(cantDictation);
        var i = 0;
        var error_generateDictationMelodic = false;

        while (i < nroDic && !error_generateDictationMelodic) {
            const dateNow = Date.now();

            var generateOk = false;
            var cantRecMax = 35;
            var cantRec = 0;
            while (!generateOk && cantRec < cantRecMax) {
                // Rhythmic
                var res_generarDictadoRitmico =
                    dictadoRitmico.generarDictadoRitmico(
                        tarjetas,
                        nroCompases,
                        compas,
                        simple
                    );
                var dictadoRitmico_Compases =
                    res_generarDictadoRitmico.dictadoRitmico;
                var numeradorDictadoRitmico =
                    res_generarDictadoRitmico.numerador;
                var denominadorDictadoRitmico =
                    res_generarDictadoRitmico.denominador;
                var figurasDictado = getFiguras(dictadoRitmico_Compases);
                var largoDictadoMelodico = figurasDictado.length;
                // Melodic
                var res_dictadoMelodico =
                    dictadoMelodico.generarDictadoMelodico(
                        notasRegla_trad,
                        nivelPrioridadRegla,
                        intervaloNotas_trad,
                        notasBase_trad,
                        notasFin_trad,
                        nivelPrioridadClave,
                        largoDictadoMelodico,
                        escalaDiatonicaRegla,
                        notaReferencia_trad
                    );
                generateOk = res_dictadoMelodico[0];
                cantRec++;
            }

            if (!res_dictadoMelodico[0]) {
                error_generateDictationMelodic = true;
                return res.status(404).send({
                    ok: false,
                    issueConfig: true,
                    message: res_dictadoMelodico[1],
                });
            } else {
                const dictadoMelodico_traducido = res_dictadoMelodico[1];
                const clave = res_dictadoMelodico[2];
                const escala_diatonica = res_dictadoMelodico[3];
                const notaRefTrans = res_dictadoMelodico[5][0];

                const compasId = await db
                    .knex('Compas')
                    .where({
                        Nombre:
                            numeradorDictadoRitmico +
                            '/' +
                            denominadorDictadoRitmico,
                    })
                    .select('id');

                // Insert Dictado
                dictationInsert.push({
                    NotaReferencia: notaRefTrans,
                    Tonalidad: escala_diatonica,
                    Clave: clave,
                    CompasId: compasId[0].id,
                    Bpm: gral.getBPMRandom(bpm),
                    DictadoRitmico: dictado_ritmico,
                    CreadorUsuarioId: id,
                    ConfiguracionDictadoId: idConfigDictation,
                });

                // Insert Dictado_Nota
                let notes = '';
                for (let i = 0; i < dictadoMelodico_traducido.length; i++) {
                    const nota = dictadoMelodico_traducido[i];
                    if (i == dictadoMelodico_traducido.length - 1) {
                        notes = notes + nota;
                    } else {
                        notes = notes + nota + '|';
                    }
                }
                dictationNoteInsert.push(notes);

                // Insert Dictado_CelulaRitmica
                let dictationCRAux = [];
                for (let i = 0; i < dictadoRitmico_Compases.length; i++) {
                    const figs = dictadoRitmico_Compases[i];
                    dictationCRAux.push({
                        // DictadoId -> set after insert dictationInsert
                        Orden: i,
                        Figuras: figs,
                    });
                }
                dictationCRInsert.push(dictationCRAux);

                i++;
            }
        }

        if (dictationInsert.length == 0) {
            return res.status(400).send({
                ok: false,
                issueConfig: true,
                message: 'No se generó ningún dictado.',
            });
        } else {
            if (onlyValidation == 'false') {
                let dicts = [];
                await db.knex.transaction(async (trx) => {
                    for (let i = 0; i < dictationInsert.length; i++) {
                        const dict = dictationInsert[i];

                        const dictRes = await db
                            .knex('Dictado')
                            .insert(dict)
                            .returning(['id'])
                            .transacting(trx);
                        const dictId = dictRes[0].id;
                        dicts.push(dictId);

                        let dictationNoteInsertFinal = [];
                        dictationNoteInsertFinal.push({
                            Notas: dictationNoteInsert[i],
                            Orden: 0,
                            DictadoId: dictId,
                        });

                        let dictationCRInsertFinal = [];
                        let order = 0;
                        for (let j = 0; j < dictationCRInsert[i].length; j++) {
                            for (
                                let k = 0;
                                k < dictationCRInsert[i][j].Figuras.length;
                                k++
                            ) {
                                const fig = dictationCRInsert[i][j].Figuras[k];
                                dictationCRInsertFinal.push({
                                    Orden: order,
                                    OrdenPulsos: dictationCRInsert[i][j].Orden,
                                    Figuras: dictationCRInsert[i][j].Figuras[k],
                                    DictadoId: dictId,
                                });
                                order++;
                            }
                        }

                        const aa = await db
                            .knex('Dictado_CelulaRitmica')
                            .insert(dictationCRInsertFinal)
                            .returning(['id'])
                            .transacting(trx);

                        const bb = await db
                            .knex('Dictado_Nota')
                            .insert(dictationNoteInsertFinal)
                            .returning(['id'])
                            .transacting(trx);
                    }

                    res.status(200).send({
                        ok: true,
                        issueConfig: false,
                        message: 'Ok',
                        dictations: dicts,
                    });
                });
            } else {
                // endpoint is called to know if I can generate any dictation
                return res.status(200).send({
                    ok: true,
                    issueConfig: false,
                    message: 'Se puede generar dictados con la configuración.',
                });
            }
        }
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getDictation(req, res) {
    try {
        const { id } = req.params; // user id
        const { idConfigDictation } = req.query;

        const dicts = await db
            .knex('Dictado')
            .where({
                'Dictado.ConfiguracionDictadoId': idConfigDictation,
                'Dictado.CreadorUsuarioId': id,
            })
            .join(
                'Dictado_CelulaRitmica',
                'Dictado_CelulaRitmica.DictadoId',
                '=',
                'Dictado.id'
            )
            .join('Dictado_Nota', 'Dictado_Nota.DictadoId', '=', 'Dictado.id')
            .join('Compas', 'Compas.id', '=', 'Dictado.CompasId')
            .select(
                'Dictado.id',
                'Dictado_CelulaRitmica.Orden',
                'Dictado_CelulaRitmica.OrdenPulsos',
                'Dictado_CelulaRitmica.Figuras',
                'Dictado_Nota.Notas',
                'Dictado.created_at',
                'Dictado.Clave',
                'Dictado.Tonalidad',
                'Dictado.NotaReferencia',
                'Compas.Nombre',
                'Dictado.Bpm',
                'Dictado.DictadoRitmico'
            );

        const califications = await db
            .knex('Dictado')
            .where({
                'Dictado.ConfiguracionDictadoId': idConfigDictation,
                'Dictado.CreadorUsuarioId': id,
            })
            .join(
                'Dictado_Calificacion',
                'Dictado_Calificacion.DictadoId',
                '=',
                'Dictado.id'
            )
            .select(
                'Dictado.id',
                'Dictado_Calificacion.Calificacion',
                'Dictado_Calificacion.TipoError',
                'Dictado_Calificacion.created_at'
            );

        const dictations = [];
        const dictsGrouped = GroupByIdAndShortByOrder(dicts);
        dictsGrouped.forEach((d) => {
            let figuras = [];
            let figurasPulso = [];
            let orderP = d[0].OrdenPulsos;
            d.forEach((figs) => {
                if (figs.OrdenPulsos != orderP) {
                    orderP = figs.OrdenPulsos;
                    figuras.push(figurasPulso);
                    figurasPulso = [];
                }

                figurasPulso.push(figs.Figuras);
            });
            figuras.push(figurasPulso);
            dictations.push({
                id: d[0].id,
                figuras: figuras,
                configuracion_dictado: idConfigDictation,
                fecha_generado: d[0].created_at,
                notas: d[0].Notas.split('|'),
                clave: d[0].Clave,
                escala_diatonica: d[0].Tonalidad,
                nota_base: d[0].NotaReferencia,
                numerador: d[0].Nombre.split('/')[0],
                denominador: d[0].Nombre.split('/')[1],
                resuelto: califications.filter((c) => c.id === d[0].id),
                bpm: d[0].Bpm,
                dictado_ritmico: d[0].DictadoRitmico,
            });
        });

        res.status(200).send({
            ok: true,
            dictations: dictations,
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

// Guarda en la base la autoevaluacion del usuario
// datos que recibe:
// {
//     "email":"martin@hotmail.com",
//     "id_dictado":"60da1135017a8f1f875dd686", (debe existir en la base)
//     "resuelto": {"fecha": "2021-06-28T18:13:09.041+00:00", "nota":12, "tipoError": [ritmico,armonico,ambos] }
// }
const agregarNuevoResultado = async (req, res) => {
    // console.log(req.body)
    try {
        const { email, id_dictado, resuelto } = req.body;
        // busco el usuario implicado, le agrego al dictado correspondiente su nueva autoevaluacion
        // luego hago un save de ese usuario
        Usuario.findOne({ email: email }, (err, userActual) => {
            if (userActual != null) {
                dictadoActual = userActual.dictados.find( 
                    (element) => element._id == id_dictado
                );
                if (dictadoActual != null) {
                    dictadoActual.resuelto.push(resuelto);
                    userActual.save();
                    res.status(200).send({
                        ok: true,
                        message: 'Rsultado guardado',
                    });
                } else {
                    res.status(404).send({
                        ok: false,
                        message: 'No se ha encontrado el dictado',
                    });
                }
            } else {
                res.status(404).send({
                    ok: false,
                    message: 'No se ha encontrado el usuario',
                });
            }
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
};

module.exports = {
    agregarNuevoResultado,
    addUser,
    generateDictation,
    getDictation,
    obtenerUsuarioRegistrado,
};
