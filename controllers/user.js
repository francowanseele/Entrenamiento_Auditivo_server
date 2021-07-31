const Usuario = require('../models/usuario');
const Curso = require('../models/curso');
const dictadoRitmico = require('../services/DictadosRitmicos/generarDictadosRitmicos');
const dictadoMelodico = require('../services/DictadosMelodicos/generarDictadosMelodicos');
const gral = require('../services/funcsGralDictados');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
        bcrypt.hash(password, saltRounds).then((hashedPassword)=>{

            // console.log(hashedPassword)
            const user = new Usuario();
            user.nombre = name;
            user.apellido = lastname;
            user.email = email;
            user.password = hashedPassword;
            user.esDocente = isTeacher;
            user.curso_personal = idCoursePersonal;
            user.cursa_curso = studyCourseArray;
            user.dicta_curso = dictateCourseArray;
            user.pertenece_instituto = inInstituteArray;
    
            user.save((err, newUser) => {
                if (err) {
                    console.log(err)
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
        })
        } catch (error) {
            res.status(501).send({
                ok: false,
                message: error.message,
            });
        }
          
       
       
}


// Obtener un usuario de la base a partir de su Correo y pass
//Datos de entrada: { email: '' , password: '' }
const  obtenerUsuarioRegistrado = async (req,res) => {
    console.log('entro al obtener')
    try {
        const {
            email,           
            password            
        } = req.body;
      
        Usuario.findOne({"email": email}, (err, result) => {
            if ( result != null){
                if (!result.esDocente){                
                    bcrypt.compare(password, result.password, function(err, resultPass) {
                        // resultPass == true
                        if (resultPass){ 
                            res.status(200).send({
                                ok: true,
                                personal_course:result.curso_personal,
                                id_user:result._id,
                                name: result.nombe,
                                email: result.email,
                                password: result.password,
                                esDocente: result.esDocente,
                                message: 'Usuario encontrado',
                            });
                        }else{
                            res.status(404).send({
                                ok: false,
                                message: 'password incorrecta',
                            });
                        }
                    });
                }               
            }else{
                res.status(404).send({
                    ok: false,
                    message: 'No se ha encontrado el usuario',
                });
            }
        })
    
    } catch (err) {
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
                        escalaDiatonicaRegla
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

                const dictation = {
                    curso: idCourse,
                    modulo: idModule,
                    configuracion_dictado: idConfigDictation,
                    fecha_generado: dateNow,
                    notas: dictadoMelodico_traducido, // ya trducidas
                    figuras: dictadoRitmico_Compases, // con compás
                    clave: clave,
                    escala_diatonica: escala_diatonica,
                    nota_base: notaBase,
                    numerador: numeradorDictadoRitmico,
                    denominador: denominadorDictadoRitmico,
                    resuelto: [],
                    bpm: bpm,
                    dictado_ritmico: dictado_ritmico,
                };

                res_dictation.push(dictation);
                i++;
            }
        }

        if (res_dictation.length == 0) {
            return res.status(400).send({
                ok: false,
                issueConfig: true,
                message: 'No se generó ningún dictado.',
            });
        } else {
            Curso.findById({ _id: idCourse }, (err, courseData) => {
                if (err) {
                    res.status(500).send({
                        ok: false,
                        issueConfig: false,
                        message: 'Error del servidor.',
                    });
                } else if (!courseData) {
                    res.status(404).send({
                        ok: false,
                        issueConfig: false,
                        message: 'No se ha encontrado el curso',
                    });
                } else {
                    let course = courseData;

                    const existModule = find(course.modulo, idModule);
                    if (!existModule) {
                        return res.status(404).send({
                            ok: false,
                            issueConfig: false,
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
                                        issueConfig: false,
                                        message: 'Error del servidor',
                                    });
                                } else if (!userData) {
                                    res.status(404).send({
                                        ok: false,
                                        issueConfig: false,
                                        message:
                                            'No se ha encontrado al estudiante',
                                    });
                                } else {
                                    res.status(200).send({
                                        ok: true,
                                        issueConfig: false,
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
    obtenerUsuarioRegistrado
};
