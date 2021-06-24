const Usuario = require('../models/usuario');
const Curso = require('../models/curso');
const dictadoRitmico = require('../services/DictadosRitmicos/generarDictadosRitmicos');
const dictadoMelodico = require('../services/DictadosMelodicos/generarDictadosMelodicos');
const gral = require('../services/funcsGralDictados');

const find = (arr, id) => {
    var exist = false;
    arr.forEach((elem) => {
        if (elem._id == id) {
            exist = true;
        }
    });

    return exist;
};

function addUser(req, res) {
    try {
        const {
            name,
            lastname,
            email,
            password,
            isTeacher,
            idCoursePersonal,
            studyCourseArray,
            dictateCourseArray,
            inInstituteArray,
        } = req.body;
        const user = new Usuario();
        user.nombre = name;
        user.apellido = lastname;
        user.email = email;
        user.password = password;
        user.esDocente = isTeacher;
        user.curso_personal = idCoursePersonal;
        user.cursa_curso = studyCourseArray;
        user.dicta_curso = dictateCourseArray;
        user.pertenece_instituto = inInstituteArray;

        user.save((err, newUser) => {
            if (err) {
                res.status(500).send({
                    ok: false,
                    message: 'Error en el servidor',
                });
            } else if (!newUser) {
                res.status(404).send({
                    ok: false,
                    message: 'Error al crear el Usuario',
                });
            } else {
                res.status(200).send({
                    ok: true,
                    user: newUser,
                    message: 'Usuario creado correctamente',
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

// En services/DictadosMelodicos/generarDictadosMelodicos.js
// se dice el formato de los datos de entrada,
// (cómo tienen que venir en el req.body)
function generateDictation(req, res) {
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
            numerador,
            denominador,
            notasRegla,
            nivelPrioridadRegla,
            intervaloNotas,
            notasBase,
            notasFin,
            nivelPrioridadClave,
            escalaDiatonicaRegla,
            date,
        } = req.body;
        const { id } = req.params;
        const { idCourse, idModule, idConfigDictation, cantDictation } =
            req.query;

        // Translate to my notas cod (ex: Sol4)
        const notasRegla_trad = translateNotasRegla(notasRegla);
        const intervaloNotas_trad = transalteIntervalo(intervaloNotas);
        const notasBase_trad = gral.translateToMyNotes(notasBase);
        const notasFin_trad = gral.translateToMyNotes(notasFin);

        var res_dictation = [];
        const nroDic = parseInt(cantDictation);
        var i = 0;

        while (i < nroDic) {
            const dateNow = Date.now();
            // Rhythmic

            // Elegir numerador y denominador con prioridad
            // Agregar tarjetas con prioridad (Martin)
            const dictadoRitmico_Compases =
                dictadoRitmico.generarDictadoRitmico(
                    tarjetas,
                    nroCompases,
                    numerador,
                    denominador
                );
            const figurasDictado = getFiguras(dictadoRitmico_Compases);
            const largoDictadoMelodico = figurasDictado.length;

            // Melodic
            const res_dictadoMelodico = dictadoMelodico.generarDictadoMelodico(
                notasRegla_trad,
                nivelPrioridadRegla,
                intervaloNotas_trad,
                notasBase_trad,
                notasFin_trad,
                nivelPrioridadClave,
                largoDictadoMelodico,
                escalaDiatonicaRegla
            );

            if (!res_dictadoMelodico[0]) {
                // retornar error -> mensaje res_dictadoMelodico[1]
                return res.status(404).send({
                    ok: false,
                    message: res_dictadoMelodico[1],
                });
            } else {
                const dictadoMelodico_traducido = res_dictadoMelodico[1];
                const clave = res_dictadoMelodico[2];
                const escala_diatonica = res_dictadoMelodico[3];

                const dictation = {
                    curso: idCourse,
                    modulo: idModule,
                    configuracion_dictado: idConfigDictation,
                    fecha_generado: dateNow,
                    notas: dictadoMelodico_traducido, // ya trducidas
                    figuras: dictadoRitmico_Compases, // con compás
                    clave: clave,
                    escala_diatonica: escala_diatonica,
                    resuelto: [],
                };

                res_dictation.push(dictation);
                i++;
            }
        }

        if (res_dictation.length == 0) {
            return res.status(400).send({
                ok: false,
                message: 'No se generó ningún dictado.',
            });
        } else {
            Curso.findById({ _id: idCourse }, (err, courseData) => {
                if (err) {
                    res.status(500).send({
                        ok: false,
                        message: 'Error del servidor.',
                    });
                } else if (!courseData) {
                    res.status(404).send({
                        ok: false,
                        message: 'No se ha encontrado el curso',
                    });
                } else {
                    let course = courseData;

                    const existModule = find(course.modulo, idModule);
                    if (!existModule) {
                        return res.status(404).send({
                            ok: false,
                            message:
                                'No se ha encontrado el módulo dentro del curso',
                        });
                    } else {
                        Usuario.findByIdAndUpdate(
                            { _id: id },
                            { $push: { dictados: { $each: res_dictation } } },
                            (err, userData) => {
                                if (err) {
                                    res.status(500).send({
                                        ok: false,
                                        message: 'Error del servidor',
                                    });
                                } else if (!userData) {
                                    res.status(404).send({
                                        ok: false,
                                        message:
                                            'No se ha encontrado al estudiante',
                                    });
                                } else {
                                    res.status(200).send({
                                        ok: true,
                                        message: 'Ok',
                                        dictations: getDictationsFilter(
                                            userData.dictados,
                                            idConfigDictation
                                        ),
                                    });
                                }
                            }
                        );
                    }
                }
            });
        }
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

function getDictation(req, res) {
    try {
        const getDictation_ConfigDictation = (dict, idConfig) => {
            var res = [];
            dict.forEach((d) => {
                if (d.configuracion_dictado == idConfig) {
                    res.push(d);
                }
            });

            return res;
        };

        const { id } = req.params; // user id
        const { idConfigDictation } = req.query;

        Usuario.findById({ _id: id }, (err, userData) => {
            if (err) {
                res.status(500).send({
                    ok: false,
                    message: 'Error del servidor.',
                });
            } else if (!userData) {
                res.status(404).send({
                    ok: false,
                    message: 'No se ha encontrado Usuario.',
                });
            } else {
                let user = userData;
                // TODO -> order by fecha
                const dictadosFilter = getDictation_ConfigDictation(
                    user.dictados,
                    idConfigDictation
                );
                res.status(200).send({
                    ok: true,
                    dictations: dictadosFilter,
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
    addUser,
    generateDictation,
    getDictation,
};
