const db = require('../data/knex');
const formatData = require('../services/formatData');
const { inscriptionState } = require('../enums/inscriptionState');
const { logError } = require('../services/errorService');
const { getAuthenticationToken } = require('../services/headers');

async function addCourse(req, res) {
    try {
        const { name, description, personal, idInstitute, idUser } = req.body;

        const courses = await db
            .knex('Curso')
            .insert({
                Nombre: name,
                Descripcion: description,
                Personal: personal,
                InstitutoId: idInstitute,
                CreadoPor: idUser,
            })
            .returning(['id', 'Nombre', 'Descripcion']);

            res.status(200).send({
            ok: true,
            course: courses[0],
            message: 'Curso creado correctamente',
        });
    } catch (error) {
        logError('addCourse', error, req);
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
                Responsable: false,
                // Estado: inscriptionState.pending
            })
            .returning(['id', 'UsuarioId', 'CursoId', 'Responsable']);

        res.status(200).send({
            ok: true,
            course: userTeachCourse[0],
            message: 'Ok',
        });
    } catch (error) {
        logError('addCourseToDictaTeacher', error, req);
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
        logError('addStudentToCourse', error, req);
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
        logError('getCoursesCursaStudent', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getAllCourseRegardlessInstituteUser(_, res) {
    try {
        const courses = await db
            .knex('Curso')
            .select('Curso.id', 'Curso.Nombre', 'Curso.Descripcion', 'Curso.Personal');

        res.status(200).send({
            ok: true,
            cursos: courses,
            message: 'Ok',
        });
    } catch (error) {
        logError('getAllCourseRegardlessInstituteUser', error, null);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

// Get courses without institute 
// AND
// Get courses with institute which user is register
async function getAllCourse(req, res) {
    try {
        const user = getAuthenticationToken(req);

        const courses = await db
            .knex('Usuario')
            .where({ 'Usuario.id': user.id })
            .select('Curso.id', 'Curso.Nombre', 'Curso.Descripcion', 'Curso.Personal')
            .join('Usuario_Instituto', 'Usuario.Email', '=', 'Usuario_Instituto.Email')
            .join('Instituto', 'Usuario_Instituto.InstitutoId', '=', 'Instituto.id')
            .join('Curso', 'Instituto.id', '=', 'Curso.InstitutoId')
            .groupBy('Curso.id', 'Curso.Nombre', 'Curso.Descripcion', 'Curso.Personal');

        const coursesWithoutInstitute = await db
            .knex('Curso')
            .whereNull('Curso.InstitutoId')
            .select('Curso.id', 'Curso.Nombre', 'Curso.Descripcion', 'Curso.Personal');

        res.status(200).send({
            ok: true,
            cursos: courses.concat(coursesWithoutInstitute),
            message: 'Ok',
        });
    } catch (error) {
        logError('getAllCourse', error, req);
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
        logError('getPersonalCourse', error, req);
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
                    created_by: getAuthenticationToken(req).id,
                })
                .returning(['id', 'Nombre', 'Descripcion', 'CursoId']);

            res.status(200).send({
                ok: true,
                course: module[0],
                message: 'Ok',
            });
        }
    } catch (error) {
        logError('addModule', error, req);
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
                'ConfiguracionDictado.id as idConfigDictado',
            )
            .leftJoin(
                'ConfiguracionDictado',
                'ConfiguracionDictado.ModuloId',
                '=',
                'Modulo.id'
            );

        const modulesAcordesJazz = await db
            .knex('Modulo')
            .where({ 'Modulo.CursoId': id })
            .select(
                'Modulo.id',
                'Modulo.Nombre',
                'Modulo.Descripcion',
                'ConfiguracionAcordeJazz.Nombre as NombreAcordeJazz',
                'ConfiguracionAcordeJazz.Descripcion as DescripcionAcordeJazz',
                'ConfiguracionAcordeJazz.id as idAcordeJazz'
            )
            .leftJoin(
                'ConfiguracionAcordeJazz',
                'ConfiguracionAcordeJazz.ModuloId',
                '=',
                'Modulo.id'
            );

        res.status(200).send({
            ok: true,
            modules: formatData.GroupByModuleAndConfigDict(modules, modulesAcordesJazz),
            message: 'Ok',
        });
    } catch (error) {
        logError('getModules', error, req);
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
        logError('getConfigsDictations', error, req);
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
                    id: cr[0].id,
                    imagen: cr[0].Imagen,
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
                    lecturaAmbasDirecciones: gm[0].LecturaAmbasDirecciones,
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

        const getLigadurasFormat = (ligaduras) => {
            let ligaduraData = [];

            const ligadurasIdsAux = ligaduras.map((l) => {
                return l.id;
            });

            // Get ConfiguracionDictado_Ligadura ids without repetition
            const ligadurasIds = ligadurasIdsAux.filter((l, index) => {
                return ligadurasIdsAux.indexOf(l) === index;
            });

            /**
             *  {
             *      firstId
             *      firstFigura
             *      prioridad
             *      must
             *      order
             *  }
             */
            ligadurasIds.forEach((lId) => {
                let resFirst = [];
                let resSecond = [];

                ligaduras.forEach((l) => {
                    if (l.id == lId) {
                        let found = false;
                        resFirst.forEach((f) => {
                            if (
                                f.firstId == l.FirstCRId &&
                                f.firstFigura == l.FirstCRFigura &&
                                f.order == l.FirstCROrden
                            ) {
                                found = true;
                            }
                        });

                        if (!found) {
                            resFirst.push({
                                firstId: l.FirstCRId,
                                firstFigura: l.FirstCRFigura,
                                prioridad: l.Prioridad,
                                must: l.Must,
                                order: l.FirstCROrden,
                            });
                        }

                        found = false;
                        resSecond.forEach((s) => {
                            if (
                                s.secondId == l.SecondCRId &&
                                s.secondFigura == l.SecondCRFigura &&
                                s.order == l.SecondCROrden
                            ) {
                                found = true;
                            }
                        });

                        if (!found) {
                            resSecond.push({
                                secondId: l.SecondCRId,
                                secondFigura: l.SecondCRFigura,
                                prioridad: l.Prioridad,
                                must: l.Must,
                                order: l.SecondCROrden,
                            });
                        }
                    }
                });

                ligaduraData.push({
                    ligaduraId: lId,
                    Prioridad: resFirst[0].prioridad,
                    Must: resFirst[0].must,
                    firstCR: resFirst,
                    secondCR: resSecond,
                });
            });

            let res = [];
            ligaduraData.forEach((data) => {
                let firstCROrded;
                let secondCROrded;

                firstCROrded = data.firstCR.sort((x, y) =>
                    x.order > y.order ? 1 : -1
                );
                secondCROrded = data.secondCR.sort((x, y) =>
                    x.order > y.order ? 1 : -1
                );

                let first = '';
                let second = '';
                for (let i = 0; i < firstCROrded.length; i++) {
                    const f = firstCROrded[i];

                    if (i != 0) {
                        first = first.concat('-', f.firstFigura);
                    } else {
                        first = first.concat(f.firstFigura);
                    }
                }

                for (let i = 0; i < secondCROrded.length; i++) {
                    const s = secondCROrded[i];
                    if (i != 0) {
                        second = second.concat('-', s.secondFigura);
                    } else {
                        second = second.concat(s.secondFigura);
                    }
                }

                res.push({
                    elem: {
                        first: first,
                        firstId: firstCROrded[0].firstId,
                        second: second,
                        secondId: secondCROrded[0].secondId,
                    },
                    priority: data.Prioridad,
                    must: data.Must,
                    id: data.ligaduraId,
                });
            });

            return res;
        };

        const { id } = req.params;

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
                'DictadoRitmico',
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
                'ConfiguracionDictado_GiroMelodico.LecturaAmbasDirecciones',
                'GiroMelodico.Mayor',
                'GiroMelodico.DelSistema',
                'GiroMelodico_Nota.Nota',
                'GiroMelodico_Nota.Orden'
            )
            .join(
                'GiroMelodico',
                'GiroMelodico.id',
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
                'CelulaRitmica.Imagen',
                'ConfiguracionDictado_CelulaRitmica.Prioridad',
                'CelulaRitmica.Simple',
                'CelulaRitmica.Valor',
                'CelulaRitmica_Figura.Figura',
                'CelulaRitmica_Figura.Orden'
            )
            .join(
                'CelulaRitmica',
                'CelulaRitmica.id',
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

        const ligaduras = await db
            .knex('ConfiguracionDictado_Ligadura')
            .where({
                'ConfiguracionDictado_Ligadura.ConfiguracionDictadoId':
                    config.id,
            })
            .select(
                'ConfiguracionDictado_Ligadura.id',
                'ConfiguracionDictado_Ligadura.Prioridad',
                'ConfiguracionDictado_Ligadura.Must',
                'FirstCR.id as FirstCRId',
                'FirstCR_Fig.Figura as FirstCRFigura',
                'FirstCR_Fig.Orden as FirstCROrden',
                'SecondCR.id as SecondCRId',
                'SecondCR_Fig.Figura as SecondCRFigura',
                'SecondCR_Fig.Orden as SecondCROrden'
            )
            .join(
                'CelulaRitmica as FirstCR',
                'FirstCR.id',
                '=',
                'ConfiguracionDictado_Ligadura.FirstCelulaRitmicaId'
            )
            .join(
                'CelulaRitmica as SecondCR',
                'SecondCR.id',
                '=',
                'ConfiguracionDictado_Ligadura.SecondCelulaRitmicaId'
            )
            .join(
                'CelulaRitmica_Figura as FirstCR_Fig',
                'FirstCR_Fig.CelulaRitmicaId',
                '=',
                'FirstCR.id'
            )
            .join(
                'CelulaRitmica_Figura as SecondCR_Fig',
                'SecondCR_Fig.CelulaRitmicaId',
                '=',
                'SecondCR.id'
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
                mayor:
                    girosMelodicos && girosMelodicos.length > 0
                        ? girosMelodicos[0].Mayor
                        : true,
                dictado_ritmico: config.DictadoRitmico,
                ligaduraRegla: getLigadurasFormat(ligaduras),
            },
            message: 'Ok',
        });
    } catch (error) {
        logError('getConfigDictation', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getConfigDictationByString(req, res) {
    try {
        const { searchText } = req.params;

        const userId = getAuthenticationToken(req).id;

        const userCourseId = await db
            .knex('Usuario')
            .where({ id: userId })
            .select('Usuario.CursoPersonalId');

        const configs = await db
            .knex('ConfiguracionDictado')
            .whereILike('ConfiguracionDictado.Nombre', `%${searchText}%`)
            .orWhereILike('ConfiguracionDictado.Descripcion', `%${searchText}%`)
            .join('Modulo', 'ConfiguracionDictado.ModuloId', '=', 'Modulo.id')
            .join('Curso', 'Modulo.CursoId', '=', 'Curso.id')
            .select(
                'ConfiguracionDictado.id',
                'ConfiguracionDictado.Nombre',
                'ConfiguracionDictado.Descripcion',
                'Modulo.Nombre as ModuloNombre',
                'Modulo.Descripcion as ModuloDescripcion',
                'Curso.Nombre as CursoNombre',
                'Curso.Descripcion as CursoDescripcion',
                'Curso.Personal',
                'Curso.id as CursoId'
            );

        res.status(200).send({
            ok: true,
            configs: configs.filter(
                (config) =>
                    (config.Personal &&
                        config.CursoId == userCourseId[0].CursoPersonalId) ||
                    !config.Personal
            ),
            message: 'Ok',
        });
    } catch (error) {
        logError('getConfigDictationByString', error, req);
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
                        LecturaAmbasDirecciones: gm.lecturaAmbasDirecciones,
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
                        LecturaAmbasDirecciones: gm.lecturaAmbasDirecciones,
                    });
                }
            }

            return objectToInsert;
        };

        // Given ligaduraRegla ([{elem: {first: '8-8', firstId: 1, second: '8-16-16', secondId: 2}, priority: 1, must: false}, {...}, ... ])
        // return object array of type ConfiguracionDictado_Ligadura to insert
        const getConfigDictLigaduraInsert = (ligaduraRegla, configDictId) => {
            let res = [];
            ligaduraRegla.forEach((l) => {
                res.push({
                    ConfiguracionDictadoId: configDictId,
                    FirstCelulaRitmicaId: l.elem.firstId,
                    SecondCelulaRitmicaId: l.elem.secondId,
                    Prioridad: l.priority,
                    Must: l.must,
                });
            });

            return res;
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
            ligaduraRegla,
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

            if (ligaduraRegla.length > 0) {
                await db
                    .knex('ConfiguracionDictado_Ligadura')
                    .insert(
                        getConfigDictLigaduraInsert(ligaduraRegla, configDictId)
                    )
                    .transacting(trx);
            }
        });

        res.status(200).send({
            ok: true,
            configuracionDictado: configDictAdded[0],
            message: 'Ok',
        });
    } catch (error) {
        logError('addConfigDictation', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function  getCalificacionPorCursoYNotasPromedios(req, res){

    // async function getCursoById(idCourse){
    //     return await curso.findById({_id:idCourse}, (err, curseData) =>{
    //         if (err) {
    //            return 'error del servidor'
    //         } else if (!curseData) {
    //             return 'no se ha encontrado el curso'
    //         } else {
    //             return curseData
               
    //         }
    //     })
        
    // }
    // const getNotaPromedio = (resueltosArray) => {
    //     let notaTotal = 0;
    //     for (let i=0;i<resueltosArray.length; i++){
    //         if (resueltosArray[i] && resueltosArray[i].nota) {
    //             notaTotal = notaTotal + parseInt(resueltosArray[i].nota);
    //         }
    //     }
    //     const notaRes =(notaTotal / resueltosArray.length)
    //     return notaRes
    // }
    // const getErrorMasComun = (resueltosArray) => {
    //     let ambos = 0;
    //     let ritmicos = 0;
    //     let melodicos = 0;
    //     for (let i=0;i<resueltosArray.length; i++){
    //         if (resueltosArray[i] && resueltosArray[i].tipoError) {
    //             if (resueltosArray[i].tipoError == 'ritmico'){
    //                 ritmicos = ritmicos + 1;
    //             }else if (resueltosArray[i].tipoError == 'melodico'){
    //                 melodicos = melodicos +1;
    //             }
    //             else if (resueltosArray[i].tipoError == 'ambos'){
    //                 ambos = ambos + 1;
    //             }
    //         }
    //     }
    //     if ( ritmicos != 0 || ambos != 0 || melodicos != 0 ){
    //         if (( ritmicos < ambos ) && ( melodicos < ambos )){
    //             return 'ambos'
    //         }else  if (( ambos < ritmicos ) && ( melodicos < ritmicos )){
    //             return 'ritmicos'
    //         }else  if (( ritmicos < melodicos ) && ( ambos < melodicos )){
    //             return 'melodicos'
    //         }
    //     }else return 'no especifica'
    // }

    // async function getNameCourseCalifs(resParam){
    //     let nombreModulo;
    //     let resFinal = resParam;
    //     let resCurrent = [];
    //     currentModulos = [];
    //     let totalNotasModulo = 0;
    //     let cantConfiguraciones = 0;
    //     let totalNotasCurso = 0;
    //     let cantModulos = 0;
    //     for(let course in resFinal){
    //         await getCursoById(course).then((currentCurso)=>{
    //                 currentModulos = currentCurso.modulo;
    //                 nombreModulo = '';
    //                 totalNotasCurso = 0;
    //                 for (moduleCurrent in resFinal[course].modulos){
    //                     cantModulos = cantModulos + 1;
    //                     totalNotasModulo = 0;
    //                     cantConfiguraciones = 0;
    //                     for ( currmod in currentModulos ){
    //                         if((currentModulos[currmod]._id) == (moduleCurrent)  ){
    //                             nombreModulo = currentModulos[currmod].nombre;
    //                             for (conf in resFinal[course].modulos[moduleCurrent].configuraciones){
    //                                 cantConfiguraciones = cantConfiguraciones + 1;
    //                                 totalNotasModulo = totalNotasModulo + resFinal[course].modulos[moduleCurrent].configuraciones[conf].promedio;
    //                                 for (confBase in currentModulos[currmod].configuracion_dictado){
    //                                     if (currentModulos[currmod].configuracion_dictado[confBase]._id == conf){
    //                                         resFinal[course].modulos[moduleCurrent].configuraciones[conf].nombre_configuracion = currentModulos[currmod].configuracion_dictado[confBase].nombre 
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                     }
    //                     resFinal[course].modulos[moduleCurrent].promedio = (totalNotasModulo / cantConfiguraciones)
    //                     resFinal[course].modulos[moduleCurrent].nombre_modulo = nombreModulo;
    //                     totalNotasCurso = totalNotasCurso + (totalNotasModulo / cantConfiguraciones)
    //                 }
    //                 resFinal[course].nombre_curso = currentCurso.nombre;
    //                 resFinal[course].promedio = (totalNotasCurso / cantModulos )
    //         }).then(()=>{
    //             resCurrent = resFinal
    //         })
    //     }
    //     return resCurrent
    // }

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
        logError('getCalificacionPorCursoYNotasPromedios', error, null);
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
    } catch (error) {
        logError('getStudentsByIdCourse', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
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
    } catch (error) {
        logError('getTeacherCourses', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function editCourse(req, res) {
    try {
        const { id } = req.params;
        const { idUser } = req.query;
        const { name, description } = req.body;

        // Check if user has permission
        if (await userCanEditCourse(idUser, id)) {
            const courseUpdated = await db
                .knex('Curso')
                .where({ 'Curso.id': id })
                .update({
                    'Nombre': name,
                    'Descripcion': description,
                })
                .returning(['id', 'Nombre', 'Descripcion']);

            if (courseUpdated && courseUpdated.length > 0) {
                res.status(200).send({
                    ok: true,
                    permiso: true,
                    course: courseUpdated[0],
                    message: 'Curso editado correctamente',
                });
            }
        } else {
            res.status(200).send({
                ok: true,
                permiso: false,
                course: null,
                message: 'El usuario no tiene permisos para editar el curso',
            });
        }
    } catch (error) {
        logError('editCourse', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function editModule(req, res) {
    try {
        const { id } = req.params;
        const { idUser, idModule } = req.query;
        const { name, description } = req.body;

        // Check if user has permission
        if (await userCanEditCourse(idUser, id)) {
            const moduleUpdated = await db
                .knex('Modulo')
                .where({ 'Modulo.id': idModule })
                .update({
                    'Nombre': name,
                    'Descripcion': description,
                })
                .returning(['id', 'Nombre', 'Descripcion']);

            if (moduleUpdated && moduleUpdated.length > 0) {
                res.status(200).send({
                    ok: true,
                    permiso: true,
                    module: moduleUpdated[0],
                    message: 'Modulo editado correctamente',
                });
            }
        } else {
            res.status(200).send({
                ok: true,
                permiso: false,
                module: null,
                message: 'El usuario no tiene permisos para editar el curso',
            });
        }
    } catch (error) {
        logError('editModule', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function editConfigDictation(req, res) {
    try {
        const { id } = req.params;
        const { idUser, idConfigDictation } = req.query;
        const { name, description } = req.body;

        // Check if user has permission
        if (await userCanEditCourse(idUser, id)) {
            const configDictationUpdated = await db
                .knex('ConfiguracionDictado')
                .where({ 'ConfiguracionDictado.id': idConfigDictation })
                .update({
                    'Nombre': name,
                    'Descripcion': description,
                })
                .returning(['id', 'Nombre', 'Descripcion']);

            if (configDictationUpdated && configDictationUpdated.length > 0) {
                res.status(200).send({
                    ok: true,
                    permiso: true,
                    configDictation: configDictationUpdated[0],
                    message: 'Configuración de dictado editado correctamente',
                });
            }
        } else {
            res.status(200).send({
                ok: true,
                permiso: false,
                configDictation: null,
                message: 'El usuario no tiene permisos para editar el curso',
            });
        }
    } catch (error) {
        logError('editConfigDictation', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function userHasPermissionToEditCourse(req, res) {
    const { id } = req.params;
    const { idUser } = req.query;
    try {
        res.status(200).send({
            ok: true,
            permiso: await userCanEditCourse(idUser, id),
            message: '',
        });
    } catch (error) {
        logError('userHasPermissionToEditCourse', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

// return true if 
// userId create coruse OR course is personal course of userId OR userId teach course
const userCanEditCourse = async (userId, courseId) => {
    const courses = await db
        .knex('Curso')
        .where({ 'Curso.id': courseId })
        .select(
            'Curso.id',
            'Curso.CreadoPor',
            'Curso.Nombre',
            'Curso.Descripcion',
            'Curso.Personal',
            'Curso.InstitutoId'
        );

    const course = courses[0];

    const users = await db
        .knex('Usuario')
        .where({ 'Usuario.id': userId })
        .select('Usuario.id', 'Usuario.CursoPersonalId');

    const user = users[0];

    const userTeachCourse = await db
        .knex('UsuarioDicta_Curso')
        .where({
            'UsuarioDicta_Curso.CursoId': courseId,
            'UsuarioDicta_Curso.UsuarioId': userId,
        })
        .select('UsuarioDicta_Curso.id');

    return (
        course.CreadoPor == user.id ||
        user.CursoPersonalId == course.id ||
        userTeachCourse.length > 0
    );
};

async function unregisterStudenFromCourse(req, res) {
    try {
        const { idUser, idCourse } = req.body;

        const deleted = await db
            .knex('UsuarioCursa_Curso')
            .where({ 'UsuarioCursa_Curso.UsuarioId': idUser, 'UsuarioCursa_Curso.CursoId': idCourse })
            .del();

        res.status(200).send({
            ok: true,
            studenCourse: deleted,
            message: 'Ok',
        });
    } catch (error) {
        logError('unregisterStudenFromCourse', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function unregisterTeacherFromCourse(req, res) {
    try {
        const { idUser, idCourse } = req.body;

        const deleted = await db
            .knex('UsuarioDicta_Curso')
            .where({ 'UsuarioDicta_Curso.UsuarioId': idUser, 'UsuarioDicta_Curso.CursoId': idCourse })
            .del();

        res.status(200).send({
            ok: true,
            teacherCourse: deleted,
            message: 'Ok',
        });
    } catch (error) {
        logError('unregisterTeacherFromCourse', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    addCourse,
    addCourseToDictaTeacher,
    getAllCourse,
    getAllCourseRegardlessInstituteUser,
    addModule,
    getModules,
    getConfigsDictations,
    getConfigDictation,
    getConfigDictationByString,
    getCoursesCursaStudent,
    addConfigDictation,
    getCalificacionPorCursoYNotasPromedios,
    getStudentsByIdCourse,
    getTeacherCourses,
    addStudentToCourse,
    getPersonalCourse,
    editCourse,
    editModule,
    editConfigDictation,
    unregisterStudenFromCourse,
    unregisterTeacherFromCourse,
    userHasPermissionToEditCourse,
};
