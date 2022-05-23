const curso = require('../models/curso');
const Curso = require('../models/curso');
const usuario = require('../models/usuario');
const Usuario = require('../models/usuario');
const db = require('../data/knex');
const formatData = require('../services/formatData');

async function addCourse(req, res) {
    try {
        const { name, description, personal, idInstitute } = req.body;

        const courses = await db
            .knex('Curso')
            .insert({
                Nombre: name,
                Descripcion: description,
                Personal: personal,
                InstitutoId: idInstitute,
            })
            .returning(['id', 'Nombre', 'Descripcion']);

        res.status(200).send({
            ok: true,
            course: courses[0],
            message: 'Curso creado correctamente',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function addCourseToDictaTeacher(req, res) {
    try {
        const { idUser, idCourse } = req.body;

        const userTeachCourse = await db
            .knex('UsuarioDicta_Curso')
            .insert({
                CursoId: idCourse,
                UsuarioId: idUser,
                Responsable: true,
            })
            .returning(['id', 'UsuarioId', 'CursoId', 'Responsable']);

        res.status(200).send({
            ok: true,
            course: userTeachCourse[0],
            message: 'Ok',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function addStudentToCourse(req, res) {
    try {
        const { idUser, idCourse } = req.body;
        const fecha = new Date();

        const userInscriptCourse = await db
            .knex('UsuarioCursa_Curso')
            .insert({
                CursoId: idCourse,
                UsuarioId: idUser,
                FechaInscripcion: fecha,
            })
            .returning(['id', 'UsuarioId', 'CursoId', 'FechaInscripcion']);

        res.status(200).send({
            ok: true,
            course: userInscriptCourse[0],
            message: 'Ok',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getCoursesCursaStudent(req, res) {
    try {
        const { idUser } = req.body;

        const courses = await db
            .knex('UsuarioCursa_Curso')
            .where({ UsuarioId: idUser })
            .select('Curso.id', 'Curso.Nombre')
            .join('Curso', 'UsuarioCursa_Curso.CursoId', '=', 'Curso.id');

        res.status(200).send({
            ok: true,
            cursos: courses,
            message: 'Ok',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getAllCourse(req, res) {
    try {
        const courses = await db.knex
            .select('id', 'Nombre', 'Descripcion', 'Personal')
            .from('Curso');

        res.status(200).send({
            ok: true,
            cursos: courses,
            message: 'Ok',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getPersonalCourse(req, res) {
    try {
        const { idUser } = req.body;

        const personalCourse = await db
            .knex('Usuario')
            .where({ 'Usuario.id': idUser })
            .select('Curso.id', 'Curso.Nombre', 'Curso.Descripcion')
            .join('Curso', 'Usuario.CursoPersonalId', '=', 'Curso.id');

        res.status(200).send({
            ok: true,
            curso_personal: personalCourse[0].id,
            curso_objeto: personalCourse[0],
            message: 'Ok',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function addModule(req, res) {
    try {
        const { name, description } = req.body;
        const { id } = req.params;

        // Check if module name exist in the course
        const moduleInCourse = await db
            .knex('Modulo')
            .where({ 'Modulo.Nombre': name, 'Curso.id': id })
            .count({ count: 'Modulo.id' })
            .join('Curso', 'Modulo.CursoId', '=', 'Curso.id');

        // Insert module
        if (moduleInCourse[0].count > 0) {
            res.status(501).send({
                ok: false,
                repeated: true,
                message:
                    'El módulo que desea agregar ya existe para este curso.',
            });
        } else {
            const module = await db
                .knex('Modulo')
                .insert({
                    Nombre: name,
                    Descripcion: description,
                    CursoId: id,
                })
                .returning(['id', 'Nombre', 'Descripcion', 'CursoId']);

            res.status(200).send({
                ok: true,
                course: module[0],
                message: 'Ok',
            });
        }
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getModules(req, res) {
    try {
        const { id } = req.params;
        const modules = await db
            .knex('Modulo')
            .where({ 'Modulo.CursoId': id })
            .select(
                'Modulo.id',
                'Modulo.Nombre',
                'Modulo.Descripcion',
                'ConfiguracionDictado.Nombre as NombreConfigDictado',
                'ConfiguracionDictado.Descripcion as DescripcionConfigDictado',
                'ConfiguracionDictado.id as idConfigDictado'
            )
            .leftJoin(
                'ConfiguracionDictado',
                'ConfiguracionDictado.ModuloId',
                '=',
                'Modulo.id'
            );

        res.status(200).send({
            ok: true,
            modules: formatData.GroupByModuleAndConfigDict(modules),
            message: 'Ok',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getConfigsDictations(req, res) {
    try {
        const { idModule } = req.params;

        const configs = await db
            .knex('ConfiguracionDictado')
            .where({ ModuloId: idModule })
            .select('id', 'Nombre', 'Descripcion');

        res.status(200).send({
            ok: true,
            config: configs,
            message: 'Ok',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getConfigDictation(req, res) {
    try {
        const getCelulaRitmicaFormat = (celulasRitmicas) => {
            let res = [];
            celulasRitmicas.forEach((cr) => {
                let celula_ritmica = '';
                for (let i = 0; i < cr.length; i++) {
                    const figure = cr[i];
                    celula_ritmica = celula_ritmica + figure.Figura;
                    if (i < cr.length - 1)
                        celula_ritmica = celula_ritmica + '-';
                }

                res.push({
                    celula_ritmica: celula_ritmica,
                    simple: cr[0].Simple,
                    prioridad: cr[0].Prioridad,
                });
            });

            return res;
        };

        const getGirosMelodicosFormat = (girosMelodicos) => {
            let res = [];
            girosMelodicos.forEach((gm) => {
                let giros_melodicos = [];
                gm.forEach((note) => {
                    giros_melodicos.push(note.Nota);
                });
                res.push({
                    id: gm[0].id,
                    giros_melodicos: giros_melodicos,
                    DelSistema: gm[0].DelSistema,
                    prioridad: gm[0].Prioridad,
                });
            });

            return res;
        };

        const getNotasInArray = (arrayNotes) => {
            let res = [];
            arrayNotes.forEach((note) => {
                res.push(note.Nota);
            });

            return res;
        };

        const getCompasFormat = (compases) => {
            let res = [];
            compases.forEach((compas) => {
                const numDen = compas.Nombre.split('/');

                res.push({
                    numerador: numDen[0],
                    denominador: numDen[1],
                    simple: compas.Simple,
                    prioridad: compas.Prioridad,
                });
            });

            return res;
        };

        const { id } = req.params;

        // const configs = await db
        //     .knex('ConfiguracionDictado')
        //     .where({ 'ConfiguracionDictado.id': id })
        //     // .select()
        //     .select(
        //         'ConfiguracionDictado.id as ConfigDictId',
        //         'ConfiguracionDictado_GiroMelodico.id as ConfigDict_GMId',
        //         'GiroMelodico.id as GMId',
        //         'GiroMelodico_Nota.id as GM_NotaId',
        //         'GiroMelodico_Nota.Nota',
        //         'Tesitura.id as TesituraId',
        //         'ConfiguracionDictado_NotaInicio.id as ConfigDict_NotaInicioId',
        //         'ConfiguracionDictado_NotaFin.id as ConfigDict_NotaFinId',
        //         'ConfiguracionDictado_Tonalidad.id as ConfigDict_TonId',
        //         'ConfiguracionDictado_CelulaRitmica.id as ConfigDict_CRId',
        //         'CelulaRitmica.id as CRId',
        //         'CelulaRitmica_Figura.id as CR_FigId',
        //         'ConfiguracionDictado_Compas.id as ConfigDict_CompasId',
        //         'Compas.id as CompasId'
        //     )
        //     .join(
        //         'ConfiguracionDictado_GiroMelodico',
        //         'ConfiguracionDictado_GiroMelodico.ConfiguracionDictadoId',
        //         '=',
        //         'ConfiguracionDictado.id'
        //     )
        //     .join(
        //         'GiroMelodico',
        //         'GiroMelodico.Id',
        //         '=',
        //         'ConfiguracionDictado_GiroMelodico.GiroMelodicoId'
        //     )
        //     .join(
        //         'GiroMelodico_Nota',
        //         'GiroMelodico_Nota.GiroMelodicoId',
        //         '=',
        //         'GiroMelodico.id'
        //     )
        //     .join('Tesitura', function () {
        //         this.on(
        //             'ConfiguracionDictado.TesituraClaveSolId',
        //             '=',
        //             'Tesitura.id'
        //         ).orOn(
        //             'ConfiguracionDictado.TesituraClaveFaId',
        //             '=',
        //             'Tesitura.id'
        //         );
        //     })
        //     .join(
        //         'ConfiguracionDictado_NotaInicio',
        //         'ConfiguracionDictado_NotaInicio.ConfiguracionDictadoId',
        //         '=',
        //         'ConfiguracionDictado.id'
        //     )
        //     .join(
        //         'ConfiguracionDictado_NotaFin',
        //         'ConfiguracionDictado_NotaFin.ConfiguracionDictadoId',
        //         '=',
        //         'ConfiguracionDictado.id'
        //     )
        //     .join(
        //         'ConfiguracionDictado_Tonalidad',
        //         'ConfiguracionDictado_Tonalidad.ConfiguracionDictadoId',
        //         '=',
        //         'ConfiguracionDictado.id'
        //     )
        //     .join(
        //         'ConfiguracionDictado_CelulaRitmica',
        //         'ConfiguracionDictado_CelulaRitmica.ConfiguracionDictadoId',
        //         '=',
        //         'ConfiguracionDictado.id'
        //     )
        //     .join(
        //         'CelulaRitmica',
        //         'CelulaRitmica.id',
        //         '=',
        //         'ConfiguracionDictado_CelulaRitmica.CelulaRitmicaId'
        //     )
        //     .join(
        //         'CelulaRitmica_Figura',
        //         'CelulaRitmica_Figura.CelulaRitmicaId',
        //         '=',
        //         'CelulaRitmica.id'
        //     )
        //     .join(
        //         'ConfiguracionDictado_Compas',
        //         'ConfiguracionDictado_Compas.ConfiguracionDictadoId',
        //         '=',
        //         'ConfiguracionDictado.id'
        //     )
        //     .join(
        //         'Compas',
        //         'Compas.id',
        //         '=',
        //         'ConfiguracionDictado_Compas.CompasId'
        //     );

        // var hash = configs.reduce(
        //     (previous, current) => (
        //         previous[current.ConfigDictId]
        //             ? previous[current.ConfigDictId].push(current)
        //             : (previous[current.ConfigDictId] = [current]),
        //         previous
        //     ),
        //     {}
        // );
        // var newData = Object.keys(hash).map((k) => ({
        //     configuracion_ditado: k,
        //     giro_melodico_regla: hash[k],
        // }));

        const configs = await db
            .knex('ConfiguracionDictado')
            .where({ 'ConfiguracionDictado.id': id })
            .select(
                'id',
                'Nombre',
                'Descripcion',
                'CreadorUsuarioId',
                'TesituraClaveSolId',
                'TesituraClaveFaId',
                'PrioridadClaveSol',
                'PrioridadClaveFa',
                'NumeroCompases',
                'Simple',
                'NotaReferencia',
                'BpmMenor',
                'BpmMayor',
                'DictadoRitmico'
            );
        const config = configs[0];

        const girosMelodicos = await db
            .knex('ConfiguracionDictado_GiroMelodico')
            .where({
                'ConfiguracionDictado_GiroMelodico.ConfiguracionDictadoId':
                    config.id,
            })
            .select(
                'GiroMelodico.id',
                'ConfiguracionDictado_GiroMelodico.Prioridad',
                'GiroMelodico.Mayor',
                'GiroMelodico.DelSistema',
                'GiroMelodico_Nota.Nota',
                'GiroMelodico_Nota.Orden'
            )
            .join(
                'GiroMelodico',
                'GiroMelodico.Id',
                '=',
                'ConfiguracionDictado_GiroMelodico.GiroMelodicoId'
            )
            .join(
                'GiroMelodico_Nota',
                'GiroMelodico_Nota.GiroMelodicoId',
                '=',
                'GiroMelodico.id'
            );

        const tesitura = await db
            .knex('Tesitura')
            .where({ 'Tesitura.id': config.TesituraClaveSolId })
            .orWhere({ 'Tesitura.id': config.TesituraClaveFaId })
            .select(
                'Clave as clave',
                'NotaMenor as nota_menor',
                'NotaMayor as nota_mayor'
            );

        const notasInicio = await db
            .knex('ConfiguracionDictado_NotaInicio')
            .where({
                'ConfiguracionDictado_NotaInicio.ConfiguracionDictadoId':
                    config.id,
            })
            .select('Nota');

        const notasFin = await db
            .knex('ConfiguracionDictado_NotaFin')
            .where({
                'ConfiguracionDictado_NotaFin.ConfiguracionDictadoId':
                    config.id,
            })
            .select('Nota');

        const tonalidades = await db
            .knex('ConfiguracionDictado_Tonalidad')
            .where({
                'ConfiguracionDictado_Tonalidad.ConfiguracionDictadoId':
                    config.id,
            })
            .select('Tonalidad as escala_diatonica', 'Prioridad as prioridad');

        const celulasRitmicas = await db
            .knex('ConfiguracionDictado_CelulaRitmica')
            .where({
                'ConfiguracionDictado_CelulaRitmica.ConfiguracionDictadoId':
                    config.id,
            })
            .select(
                'CelulaRitmica.id',
                'ConfiguracionDictado_CelulaRitmica.Prioridad',
                'CelulaRitmica.Simple',
                'CelulaRitmica.Valor',
                'CelulaRitmica_Figura.Figura',
                'CelulaRitmica_Figura.Orden'
            )
            .join(
                'CelulaRitmica',
                'CelulaRitmica.Id',
                '=',
                'ConfiguracionDictado_CelulaRitmica.CelulaRitmicaId'
            )
            .join(
                'CelulaRitmica_Figura',
                'CelulaRitmica_Figura.CelulaRitmicaId',
                '=',
                'CelulaRitmica.id'
            );

        const compas = await db
            .knex('ConfiguracionDictado_Compas')
            .where({
                'ConfiguracionDictado_Compas.ConfiguracionDictadoId': config.id,
            })
            .select(
                'Compas.Nombre',
                'Compas.Simple',
                'ConfiguracionDictado_Compas.Prioridad',
                'Compas.id'
            )
            .join(
                'Compas',
                'Compas.id',
                '=',
                'ConfiguracionDictado_Compas.CompasId'
            );

        res.status(200).send({
            ok: true,
            config: {
                id: config.id,
                creado: config.CreadorUsuarioId,
                nombre: config.Nombre,
                descripcion: config.Descripcion,
                giro_melodico_regla: getGirosMelodicosFormat(
                    formatData.GroupByIdAndShortByOrder(girosMelodicos)
                ),
                tesitura: tesitura,
                notas_inicio: getNotasInArray(notasInicio),
                notas_fin: getNotasInArray(notasFin),
                clave_prioridad: [
                    {
                        clave: 'Sol',
                        prioridad: config.PrioridadClaveSol,
                    },
                    {
                        clave: 'Fa',
                        prioridad: config.PrioridadClaveFa,
                    },
                ],
                escala_diatonica_regla: tonalidades,
                celula_ritmica_regla: getCelulaRitmicaFormat(
                    formatData.GroupByIdAndShortByOrder(celulasRitmicas)
                ),
                compas_regla: getCompasFormat(compas),
                nro_compases: config.NumeroCompases,
                simple: config.Simple,
                nota_base: config.NotaReferencia,
                bpm: {
                    menor: config.BpmMenor,
                    mayor: config.BpmMayor,
                },
                dictado_ritmico: config.DictadoRitmico,
            },
            message: 'Ok',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

/**
 * ---- Body ----
 * name:
 * description:
 * giroMelodicoRegla: [{id, giros_melodicos, prioridad}]
 *      if id != null -> get from DB else add and get giros_melodicos to DB
 * tesitura:
 * startNotes:
 * endNOtes:
 * clefPriority:
 * escalaDiatonicaRegla:
 * celulaRitmicaRegla: [{id, prioridad}]
 * nroCompases:
 * compasRegla:
 * simple:
 * notaBase:
 * bpm:
 * dictado_ritmico:
 * ligaduraRegla
 */
async function addConfigDictation(req, res) {
    try {
        const findAndDelete = (arr, id) => {
            var mod = null;
            var modules = [];
            arr.forEach((elem) => {
                if (elem._id == id) {
                    mod = elem;
                } else {
                    modules.push(elem);
                }
            });

            return [modules, mod];
        };

        const addElemToArray = (arr, elem) => {
            var res = [];
            arr.forEach((e) => {
                res.push(e);
            });
            res.push(elem);
            return res;
        };

        // given 'tesitura' ({clave, nota_menor, nota_mayor})
        // return tesitura id from db
        // if tesitura doesn't exist insert news and return ids
        const getTesiturasId = async (tesitura) => {
            const tesituraSol = tesitura.find((t) => t.clave === 'Sol');
            const tesituraFa = tesitura.find((t) => t.clave === 'Fa');

            const tesiturasSolId = await db
                .knex('Tesitura')
                .where({
                    'Tesitura.NotaMenor': tesituraSol.nota_menor,
                    'Tesitura.NotaMayor': tesituraSol.nota_mayor,
                    'Tesitura.Clave': tesituraSol.clave,
                })
                .select('id');

            const tesiturasFaId = await db
                .knex('Tesitura')
                .where({
                    'Tesitura.NotaMenor': tesituraFa.nota_menor,
                    'Tesitura.NotaMayor': tesituraFa.nota_mayor,
                    'Tesitura.Clave': tesituraFa.clave,
                })
                .select('id');

            let tesituraSolId;
            let tesituraFaId;
            if (tesiturasSolId.length > 0) {
                tesituraSolId = tesiturasSolId[0];
            } else {
                const tesituraSolIdAdded = await db
                    .knex('Tesitura')
                    .insert({
                        Clave: 'Sol',
                        ByDefault: false,
                        NotaMenor: tesituraSol.nota_menor,
                        NotaMayor: tesituraSol.nota_mayor,
                    })
                    .returning(['id']);
                tesituraSolId = tesituraSolIdAdded[0].id;
            }

            if (tesiturasFaId.length > 0) {
                tesituraFaId = tesiturasFaId[0];
            } else {
                const tesituraFaIdAdded = await db
                    .knex('Tesitura')
                    .insert({
                        Clave: 'Fa',
                        ByDefault: false,
                        NotaMenor: tesituraFa.nota_menor,
                        NotaMayor: tesituraFa.nota_mayor,
                    })
                    .returning(['id']);
                tesituraFaId = tesituraFaIdAdded[0].id;
            }

            return {
                tesituraSol: tesituraSolId,
                tesituraFa: tesituraFaId,
            };
        };

        // Given 'clefPriority' ({clave, prioridad})
        // return priority of each clef (Sol, Fa)
        const getPrioritiesClef = async (clefPriority) => {
            const claveSolObject = clefPriority.find((o) => o.clave === 'Sol');
            const claveFaObject = clefPriority.find((o) => o.clave === 'Fa');
            let priorityClaveSol;
            let priorityClaveFa;
            if (claveSolObject) {
                priorityClaveSol = claveSolObject.prioridad;
            } else {
                priorityClaveSol = 0;
            }
            if (claveFaObject) {
                priorityClaveFa = claveFaObject.prioridad;
            } else {
                priorityClaveFa = 0;
            }

            return {
                priorityClaveSol: priorityClaveSol,
                priorityClaveFa: priorityClaveFa,
            };
        };

        // Given 'tonalidad' ({escala_diatonica, prioridad})
        // return object array of type ConfiguracionDictado_Tonalidad to insert
        const getConfigDictTonalidadToInsert = (tonalidad, configDictId) => {
            let objectToInsert = [];
            tonalidad.forEach((t) => {
                objectToInsert.push({
                    ConfiguracionDictadoId: configDictId,
                    Tonalidad: t.escala_diatonica,
                    Prioridad: t.prioridad,
                });
            });
            return objectToInsert;
        };

        // Given 'compasRegla' ({numerador, denominador, simple, prioridad})
        // return object array of type ConfiguracionDictado_Compas to insert
        const getConfigDictCompasToInsert = async (
            compasRegla,
            configDictId
        ) => {
            let objectToInsert = [];
            for (let i = 0; i < compasRegla.length; i++) {
                const c = compasRegla[i];
                const nameCompas =
                    c.numerador.toString() + '/' + c.denominador.toString();
                const compasId = await db
                    .knex('Compas')
                    .where({ Nombre: nameCompas, Simple: c.simple })
                    .select('id');

                objectToInsert.push({
                    ConfiguracionDictadoId: configDictId,
                    CompasId: compasId[0].id,
                    Prioridad: c.prioridad,
                    Simple: c.simple,
                });
            }
            return objectToInsert;
        };

        // Given 'celulaRitmicaRegla' ({id, prioridad})
        // return object array of type ConfiguracionDictado_CelulaRitmica to insert
        const getConfigDictCelulaRitmicaToInsert = (
            celulaRitmicaRegla,
            configDictId
        ) => {
            let objectToInsert = [];
            celulaRitmicaRegla.forEach((cr) => {
                objectToInsert.push({
                    ConfiguracionDictadoId: configDictId,
                    CelulaRitmicaId: cr.id,
                    Prioridad: cr.prioridad,
                });
            });
            return objectToInsert;
        };

        // Given 'giroMelodicoRegla' ([{id, giros_melodicos, prioridad}])
        // return object array of type ConfiguracionDictado_GiroMelodico to insert
        const getConfigDictGiroMelodicoToInsert = async (
            giroMelodicoRegla,
            configDictId,
            mayor,
            trx
        ) => {
            let objectToInsert = [];
            for (let i = 0; i < giroMelodicoRegla.length; i++) {
                const gm = giroMelodicoRegla[i];
                if (gm.id) {
                    objectToInsert.push({
                        ConfiguracionDictadoId: configDictId,
                        GiroMelodicoId: gm.id,
                        Prioridad: gm.prioridad,
                    });
                } else {
                    // add new giro melodico
                    const giroMelodicoAdded = await db
                        .knex('GiroMelodico')
                        .insert({
                            Mayor: mayor,
                            DelSistema: false,
                        })
                        .returning(['id'])
                        .transacting(trx);
                    const giroMelodicoId = giroMelodicoAdded[0].id;

                    for (let i = 0; i < gm.giros_melodicos.length; i++) {
                        const gmNota = gm.giros_melodicos[i];
                        await db
                            .knex('GiroMelodico_Nota')
                            .insert({
                                GiroMelodicoId: giroMelodicoId,
                                Nota: gmNota,
                                Orden: i,
                            })
                            .transacting(trx);
                    }

                    objectToInsert.push({
                        ConfiguracionDictadoId: configDictId,
                        GiroMelodicoId: giroMelodicoId,
                        Prioridad: gm.prioridad,
                    });
                }
            }

            return objectToInsert;
        };

        const { idModule, idUserCreate } = req.query;
        const {
            name,
            description,
            giroMelodicoRegla,
            tesitura,
            startNotes,
            endNotes,
            clefPriority,
            escalaDiatonicaRegla,
            celulaRitmicaRegla,
            nroCompases,
            compasRegla,
            simple,
            notaBase,
            bpm,
            dictado_ritmico,
            mayor,
        } = req.body;

        // Tesitura
        const { tesituraSol, tesituraFa } = await getTesiturasId(tesitura);

        // Insert config dict
        const { priorityClaveSol, priorityClaveFa } = await getPrioritiesClef(
            clefPriority
        );

        let configDictAdded;

        await db.knex.transaction(async (trx) => {
            configDictAdded = await db
                .knex('ConfiguracionDictado')
                .insert({
                    Nombre: name,
                    Descripcion: description,
                    NumeroCompases: nroCompases,
                    Simple: simple,
                    NotaReferencia: notaBase,
                    BpmMenor: bpm.menor,
                    BpmMayor: bpm.mayor,
                    DictadoRitmico: dictado_ritmico,
                    PrioridadClaveSol: priorityClaveSol,
                    PrioridadClaveFa: priorityClaveFa,
                    TesituraClaveSolId: tesituraSol.id,
                    TesituraClaveFaId: tesituraFa.id,
                    ModuloId: idModule,
                    CreadorUsuarioId: idUserCreate,
                })
                .returning(['id'])
                .transacting(trx);
            const configDictId = configDictAdded[0].id;

            // Insert start and end notes
            for (let i = 0; i < startNotes.length; i++) {
                const n = startNotes[i];
                await db
                    .knex('ConfiguracionDictado_NotaInicio')
                    .insert({
                        ConfiguracionDictadoId: configDictId,
                        Nota: n,
                    })
                    .transacting(trx);
            }

            for (let i = 0; i < endNotes.length; i++) {
                const n = endNotes[i];
                await db
                    .knex('ConfiguracionDictado_NotaFin')
                    .insert({
                        ConfiguracionDictadoId: configDictId,
                        Nota: n,
                    })
                    .transacting(trx);
            }

            // Insert ConfigDict_Tonalidad
            await db
                .knex('ConfiguracionDictado_Tonalidad')
                .insert(
                    getConfigDictTonalidadToInsert(
                        escalaDiatonicaRegla,
                        configDictId
                    )
                )
                .transacting(trx);

            // Insert ConfigDict_Compas
            await db
                .knex('ConfiguracionDictado_Compas')
                .insert(
                    await getConfigDictCompasToInsert(compasRegla, configDictId)
                )
                .transacting(trx);

            // Insert ConfigDict_CelRit
            await db
                .knex('ConfiguracionDictado_CelulaRitmica')
                .insert(
                    getConfigDictCelulaRitmicaToInsert(
                        celulaRitmicaRegla,
                        configDictId
                    )
                )
                .transacting(trx);

            // Insert ConfigDict_GiroMel
            const aa = await getConfigDictGiroMelodicoToInsert(
                giroMelodicoRegla,
                configDictId,
                mayor,
                trx
            );
            await db
                .knex('ConfiguracionDictado_GiroMelodico')
                .insert(aa)
                .transacting(trx);
        });

        res.status(200).send({
            ok: true,
            configuracionDictado: configDictAdded[0],
            message: 'Ok',
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getCalificacionPorCursoYNotasPromedios(req, res) {
    async function getCursoById(idCourse) {
        return await curso.findById({ _id: idCourse }, (err, curseData) => {
            if (err) {
                return 'error del servidor';
            } else if (!curseData) {
                return 'no se ha encontrado el curso';
            } else {
                return curseData;
            }
        });
    }
    const getNotaPromedio = (resueltosArray) => {
        let notaTotal = 0;
        for (let i = 0; i < resueltosArray.length; i++) {
            if (resueltosArray[i] && resueltosArray[i].nota) {
                notaTotal = notaTotal + parseInt(resueltosArray[i].nota);
            }
        }
        const notaRes = notaTotal / resueltosArray.length;
        return notaRes;
    };
    const getErrorMasComun = (resueltosArray) => {
        let ambos = 0;
        let ritmicos = 0;
        let melodicos = 0;
        for (let i = 0; i < resueltosArray.length; i++) {
            if (resueltosArray[i] && resueltosArray[i].tipoError) {
                if (resueltosArray[i].tipoError == 'ritmico') {
                    ritmicos = ritmicos + 1;
                } else if (resueltosArray[i].tipoError == 'melodico') {
                    melodicos = melodicos + 1;
                } else if (resueltosArray[i].tipoError == 'ambos') {
                    ambos = ambos + 1;
                }
            }
        }
        if (ritmicos != 0 || ambos != 0 || melodicos != 0) {
            if (ritmicos < ambos && melodicos < ambos) {
                return 'ambos';
            } else if (ambos < ritmicos && melodicos < ritmicos) {
                return 'ritmicos';
            } else if (ritmicos < melodicos && ambos < melodicos) {
                return 'melodicos';
            }
        } else return 'no especifica';
    };

    async function getNameCourseCalifs(resParam) {
        let nombreModulo;
        let resFinal = resParam;
        let resCurrent = [];
        currentModulos = [];
        let totalNotasModulo = 0;
        let cantConfiguraciones = 0;
        let totalNotasCurso = 0;
        let cantModulos = 0;
        for (let course in resFinal) {
            await getCursoById(course).then((currentCurso) => {
                if (currentCurso) {
                    currentModulos = currentCurso.modulo;
                    nombreModulo = '';
                    totalNotasCurso = 0;
                    for (moduleCurrent in resFinal[course].modulos) {
                        cantModulos = cantModulos + 1;
                        totalNotasModulo = 0;
                        cantConfiguraciones = 0;
                        for (currmod in currentModulos) {
                            if (currentModulos[currmod]._id == moduleCurrent) {
                                nombreModulo = currentModulos[currmod].nombre;
                                for (conf in resFinal[course].modulos[
                                    moduleCurrent
                                ].configuraciones) {
                                    cantConfiguraciones =
                                        cantConfiguraciones + 1;
                                    totalNotasModulo =
                                        totalNotasModulo +
                                        resFinal[course].modulos[moduleCurrent]
                                            .configuraciones[conf].promedio;
                                    for (confBase in currentModulos[currmod]
                                        .configuracion_dictado) {
                                        if (
                                            currentModulos[currmod]
                                                .configuracion_dictado[confBase]
                                                ._id == conf
                                        ) {
                                            resFinal[course].modulos[
                                                moduleCurrent
                                            ].configuraciones[
                                                conf
                                            ].nombre_configuracion =
                                                currentModulos[
                                                    currmod
                                                ].configuracion_dictado[
                                                    confBase
                                                ].nombre;
                                        }
                                    }
                                }
                            }
                        }
                        resFinal[course].modulos[moduleCurrent].promedio =
                            totalNotasModulo / cantConfiguraciones;
                        resFinal[course].modulos[moduleCurrent].nombre_modulo =
                            nombreModulo;
                        totalNotasCurso =
                            totalNotasCurso +
                            totalNotasModulo / cantConfiguraciones;
                    }
                    resFinal[course].nombre_curso = currentCurso.nombre;
                    resFinal[course].promedio = totalNotasCurso / cantModulos;
                }
            });
            // .then(() => {
            //     resCurrent = resFinal;
            // });
        }
        return resCurrent;
    }

    try {
        res.status(200).send({
            ok: true,
            calificaciones: [],
            message: 'Ok',
        });

        // const { idUser } = req.body;

        // let resFinal = {};
        // await Usuario.findById({ _id: idUser }, (err, userData) => {
        //     if (err) {
        //         res.status(500).send({
        //             ok: false,
        //             message: 'Error del servidor',
        //         });
        //     } else if (!userData) {
        //         res.status(404).send({
        //             ok: false,
        //             message: 'No se ha encontrado el usuario',
        //         });
        //     } else if (userData.dictados.length > 0) {
        //         let errorMasComun;
        //         let idModulo_actual;
        //         let idConfig_actual;
        //         const userDictations = userData.dictados;
        //         let notasRes = [];
        //         for (dictation of userDictations) {
        //             errorMasComun = '';
        //             notaPromedioActual = 0;
        //             notaRes = [];
        //             idCurso_actual = dictation.curso;
        //             idConfig_actual = dictation.configuracion_dictado;
        //             idModulo_actual = dictation.modulo;
        //             if (dictation.resuelto.length > 0) {
        //                 notasRes = dictation.resuelto;
        //                 if (!resFinal.hasOwnProperty(idCurso_actual)) {
        //                     resFinal[idCurso_actual] = {
        //                         nombre_curso: 'no_asignado',
        //                         modulos: {},
        //                     };
        //                 }
        //                 if (
        //                     !resFinal[idCurso_actual].modulos.hasOwnProperty(
        //                         idModulo_actual
        //                     )
        //                 ) {
        //                     resFinal[idCurso_actual].modulos[idModulo_actual] =
        //                         {
        //                             nombre_modulo: 'no_asignado',
        //                             configuraciones: {},
        //                         };
        //                 }
        //                 if (
        //                     resFinal[idCurso_actual].modulos &&
        //                     !resFinal[idCurso_actual].modulos[
        //                         idModulo_actual
        //                     ].configuraciones.hasOwnProperty(idConfig_actual)
        //                 ) {
        //                     resFinal[idCurso_actual].modulos[
        //                         idModulo_actual
        //                     ].configuraciones[idConfig_actual] = {
        //                         nombre_configuracion: 'no_asignado',
        //                         notas: [],
        //                     };
        //                 }
        //                 for (elem in notasRes) {
        //                     resFinal[idCurso_actual].modulos[
        //                         idModulo_actual
        //                     ].configuraciones[idConfig_actual].notas.push(
        //                         notasRes[elem]
        //                     );
        //                 }
        //                 notaPromedioActual = getNotaPromedio(
        //                     resFinal[idCurso_actual].modulos[idModulo_actual]
        //                         .configuraciones[idConfig_actual].notas
        //                 );
        //                 resFinal[idCurso_actual].modulos[
        //                     idModulo_actual
        //                 ].configuraciones[idConfig_actual].promedio =
        //                     notaPromedioActual;
        //             }
        //         }
        //         getNameCourseCalifs(resFinal).then((resF) => {
        //             res.status(200).send({
        //                 ok: true,
        //                 calificaciones: resF,
        //                 message: 'Ok',
        //             });
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

async function getStudentsByIdCourse(req, res) {
    const { idCourse } = req.body;
    try {
        res.status(200).send({
            ok: true,
            estudiantes: [],
            message: 'Ok',
        });
        // var query = {
        //     cursa_curso: { $elemMatch: { curso_cursado: idCourse } },
        // };
        // await Usuario.find(query).then((result) => {
        //     let newResult = [];
        //     let currentUser = {};
        //     for (user in result) {
        //         currentUser = {
        //             id: result[user]._id,
        //             nombre: result[user].nombre,
        //             apellido: result[user].apellido,
        //         };
        //         newResult.push(currentUser);
        //     }
        //     res.status(200).send({
        //         ok: true,
        //         estudiantes: newResult,
        //         message: 'Ok',
        //     });
        // });
    } catch (err) {
        res.status(501).send({
            ok: false,
            message: err.message,
        });
    }
}

async function getTeacherCourses(req, res) {
    const { idUser } = req.body;
    try {
        const { idUser } = req.body;

        const courses = await db
            .knex('UsuarioDicta_Curso')
            .where({ UsuarioId: idUser })
            .select('Curso.id', 'Curso.Nombre')
            .join('Curso', 'UsuarioDicta_Curso.CursoId', '=', 'Curso.id');

        res.status(200).send({
            ok: true,
            cursos: courses,
            message: 'Ok',
        });
    } catch (err) {
        res.status(501).send({
            ok: false,
            message: err.message,
        });
    }
}

module.exports = {
    addCourse,
    addCourseToDictaTeacher,
    getAllCourse,
    addModule,
    getModules,
    getConfigsDictations,
    getConfigDictation,
    getCoursesCursaStudent,
    addConfigDictation,
    getCalificacionPorCursoYNotasPromedios,
    getStudentsByIdCourse,
    getTeacherCourses,
    addStudentToCourse,
    getPersonalCourse,
};
