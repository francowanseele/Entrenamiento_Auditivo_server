const curso = require('../models/curso');
const Curso = require('../models/curso');
const usuario = require('../models/usuario');

function addCourse(req, res) {
    try {
        const { name, description, personal } = req.body;
        const curso = new Curso();
        curso.nombre = name;
        curso.descripcion = description;

        curso.save((err, newCourse) => {
            if (err) {
                res.status(500).send({
                    ok: false,
                    message: 'Error en el servidor',
                });
            } else if (!newCourse) {
                res.status(404).send({
                    ok: false,
                    message: 'Error al crear el Curso',
                });
            } else {
                res.status(200).send({
                    ok: true,
                    course: newCourse,
                    message: 'Curso creado correctamente',
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

function addModule(req, res) {
    try {
        const { name, description } = req.body;
        const { id } = req.params;

        // TODO antes de agregar un módulo (hacer push) fijarse si existe otro módulo con mismo nombre y descripción
        // Si existe tirar { ok: false, repetido: true }

        Curso.findByIdAndUpdate(
            { _id: id },
            { $push: { modulo: { nombre: name, descripcion: description } } },
            (err, curseResult) => {
                if (err) {
                    res.status(500).send({
                        ok: false,
                        message: 'Error del servidor',
                    });
                } else if (!curseResult) {
                    res.status(404).send({
                        ok: false,
                        message: 'No se ha encontrado el curso',
                    });
                } else {
                    res.status(200).send({
                        ok: true,
                        course: curseResult,
                        message: 'Ok',
                    });
                }
            }
        );
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

function getModules(req, res) {
    try {
        const { id } = req.params;

        Curso.findById({ _id: id }, (err, courseData) => {
            if (err) {
                res.status(500).send({
                    ok: false,
                    message: 'Error del servidor',
                });
            } else if (!courseData) {
                res.status(404).send({
                    ok: false,
                    message: 'No se ha encontrado el curso',
                });
            } else {
                let course = courseData;

                res.status(200).send({
                    ok: true,
                    modules: course.modulo,
                    message: 'Ok',
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

function addConfigDictation(req, res) {
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

        const { idCourse, idModule, idUserCreate } = req.query;
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
        } = req.body;

        Curso.findById({ _id: idCourse }, (err, courseData) => {
            if (err) {
                res.status(500).send({
                    ok: false,
                    message: 'Error del servidor',
                });
            } else if (!courseData) {
                res.status(404).send({
                    ok: false,
                    message: 'No se ha encontrado el curso',
                });
            } else {
                let course = courseData;
                const arrModules = findAndDelete(course.modulo, idModule);

                if (arrModules[1] === null) {
                    res.status(404).send({
                        ok: false,
                        message:
                            'No se ha encontrado el módulo dentro del curso.',
                    });
                } else {
                    var modules = arrModules[0];
                    var mod = arrModules[1];
                    const config_dictation = {
                        creado: idUserCreate,
                        nombre: name,
                        descripcion: description,
                        giro_melodico_regla: giroMelodicoRegla,
                        tesitura: tesitura,
                        notas_inicio: startNotes,
                        notas_fin: endNotes,
                        clave_prioridad: clefPriority,
                        escala_diatonica_regla: escalaDiatonicaRegla,
                        celula_ritmica_regla: celulaRitmicaRegla,
                        nro_compases: nroCompases,
                        compas_regla: compasRegla,
                        simple: simple,
                        nota_base: notaBase,
                        bpm: bpm,
                        dictado_ritmico: dictado_ritmico,
                    };
                    mod.configuracion_dictado.push(config_dictation);

                    modules.push(mod);

                    course.modulo = modules;
                    Curso.findByIdAndUpdate(
                        { _id: course._id },
                        course,
                        (err, courseResult) => {
                            if (err) {
                                res.status(500).send({
                                    ok: false,
                                    message: 'Error del servidor',
                                });
                            } else if (!courseResult) {
                                res.status(404).send({
                                    ok: false,
                                    message: 'No se ha encontrado el curso',
                                });
                            } else {
                                res.status(200).send({
                                    ok: true,
                                    message: 'Ok',
                                });
                            }
                        }
                    );
                }
            }
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

const getCalificacionPorCursoYNotasPromedios = (req, res) => {
    const getNotaPromedio = (resueltosArray) => {
        notaTotal = 0;
        for (let i=0;i<resueltosArray.length; i++){
            if (resueltosArray[i] && resueltosArray[i].nota) {
                notaTotal = notaTotal + parseInt(resueltosArray[i].nota);
            }
        }
        return (notaTotal / resueltosArray.length)
    }
    const getErrorMasComun = (resueltosArray) => {
        let ambos = 0;
        let ritmicos = 0;
        let melodicos = 0;
        for (let i=0;i<resueltosArray.length; i++){
            if (resueltosArray[i] && resueltosArray[i].tipoError) {
                if (tipoError = 'ritmico'){
                    ritmicos = ritmicos + 1;
                }else if (tipoError = 'melodico'){
                    melodicos = melodicos +1;
                }
                else if (tipoError == 'ambos'){
                    ambos = ambos + 1;
                }
            }
        }
        if ( ritmicos != 0 || ambos != 0 || melodicos != 0 ){
            if (( ritmicos < ambos ) && ( melodicos < ambos )){
                return 'ambos'
            }else  if (( ambos < ritmicos ) && ( melodicos < ritmicos )){
                return 'ritmicos'
            }else  if (( ritmicos < melodicos ) && ( ambos < melodicos )){
                return 'melodicos'
            }
        }else return 'no especifica'
    }
    try {
    const { idUser } = req.body;
    usuario.findById({ _id: idUser }, (err, userData) => {
        if (err) {
            res.status(500).send({
                ok: false,
                message: 'Error del servidor',
            });
        } else if (!userData) {
            res.status(404).send({
                ok: false,
                message: 'No se ha encontrado el usuario',
            });
        } else if (userData.dictados.length>0){
            let idCursoActual;
            let notaPromedioActual;
            let nombreCursoActual;
            let errorMasComun;
            const userDictations = userData.dictados;
            let  resFinal = [];
            for (let i=0; i<userDictations.length; i++){
                idCursoActual = userDictations[i].curso
                if (userDictations[i].resuelto.length>0) { 
                    notaPromedioActual = getNotaPromedio(userDictations[i].resuelto)
                    errorMasComun = getErrorMasComun(userDictations[i].resuelto)
                }
                curso.findById({_id:idCursoActual}, (err, curseData) =>{
                    if (err) {
                        res.status(500).send({
                            ok: false,
                            message: 'Error del servidor',
                        });
                    } else if (!userData) {
                        res.status(404).send({
                            ok: false,
                            message: 'No se ha encontrado el curso',
                        });
                    } else if (userDictations[i].resuelto.length>0){
                        nombreCursoActual = curseData.nombre
                        resFinal.push({
                            nombreCurso:nombreCursoActual,
                            promedio:notaPromedioActual,
                            errorMasComun: errorMasComun,
                            notas:userDictations[i].resuelto
                        })
                        if ( i == userDictations.length -1){
                            res.status(200).send({
                                ok: true,
                                calificaciones: resFinal,
                                message: 'Ok',
                            });
                        }
                    } else if ( i == userDictations.length -1){
                        res.status(200).send({
                            ok: true,
                            calificaciones: resFinal,
                            message: 'Ok',
                        });
                    }
                })
                   
                
                
            }
           
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
    addCourse,
    addModule,
    getModules,
    addConfigDictation,
    getCalificacionPorCursoYNotasPromedios
};
