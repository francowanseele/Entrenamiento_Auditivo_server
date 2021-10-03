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


async function  getCalificacionPorCursoYNotasPromedios(req, res){

    async function getCursoById(idCourse){
        return await curso.findById({_id:idCourse}, (err, curseData) =>{
            if (err) {
               return 'error del servidor'
            } else if (!curseData) {
                return 'no se ha encontrado el curso'
            } else {
                return curseData
               
            }
        })
        
    }
    const getNotaPromedio = (resueltosArray) => {
        let notaTotal = 0;
        for (let i=0;i<resueltosArray.length; i++){
            if (resueltosArray[i] && resueltosArray[i].nota) {
                notaTotal = notaTotal + parseInt(resueltosArray[i].nota);
            }
        }
        const notaRes =(notaTotal / resueltosArray.length)
        return notaRes
    }
    const getErrorMasComun = (resueltosArray) => {
        let ambos = 0;
        let ritmicos = 0;
        let melodicos = 0;
        for (let i=0;i<resueltosArray.length; i++){
            if (resueltosArray[i] && resueltosArray[i].tipoError) {
                if (resueltosArray[i].tipoError == 'ritmico'){
                    ritmicos = ritmicos + 1;
                }else if (resueltosArray[i].tipoError == 'melodico'){
                    melodicos = melodicos +1;
                }
                else if (resueltosArray[i].tipoError == 'ambos'){
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

    async function getNameCourseCalifs(resFinal){
        let nombreModulo;
        let resCurrent = [];
        currentModulos = [];
        for(let course in resFinal){
            await getCursoById(course).then((currentCurso)=>{
                    currentModulos = currentCurso.modulo;
                    nombreModulo = '';
                    for (moduleCurrent in resFinal[course].modulos){
                        //obtener nombre modulo
                        for ( currmod in currentModulos ){
                            if((currentModulos[currmod]._id) == (moduleCurrent)  ){
                                nombreModulo = currentModulos[currmod].nombre
                                for (conf in resFinal[course].modulos[moduleCurrent].configuraciones){
                                    for (confBase in currentModulos[currmod].configuracion_dictado){
                                        if (currentModulos[currmod].configuracion_dictado[confBase]._id == conf){
                                            resFinal[course].modulos[moduleCurrent].configuraciones[conf].nombre_configuracion = currentModulos[currmod].configuracion_dictado[confBase].nombre 
                                        }
                                    }
                                } 
                            }
                        }
                        resFinal[course].modulos[moduleCurrent].nombre_modulo = nombreModulo;
                    }
                    resFinal[course].nombre_curso = currentCurso.nombre;
                  
            }).then(()=>{
                resCurrent = resFinal
            })
        }
        console.log(resCurrent)
        return resCurrent
    }

    try {

    const { idUser } = req.body;
    
    let  resFinal = {};
    await usuario.findById({ _id: idUser }, (err, userData) => {
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
            let errorMasComun;
            let idModulo_actual;
            let idConfig_actual;
            const userDictations = userData.dictados;
            let notasRes = [];
            let moduloNuevo;
            for (dictation of userDictations) {
                errorMasComun = '';
                notaPromedioActual = 0;
                notaRes=[];
                idCurso_actual = dictation.curso;
                idConfig_actual = dictation.configuracion_dictado;
                idModulo_actual = dictation.modulo;
                if (dictation.resuelto.length>0) {
                    notasRes = dictation.resuelto;
                    if (!resFinal.hasOwnProperty(idCurso_actual)){
                        resFinal[idCurso_actual] = {
                            nombre_curso: 'no_asignado',
                            modulos: {},
                        }
                    }
                    if (!resFinal[idCurso_actual].modulos.hasOwnProperty(idModulo_actual)){
                        resFinal[idCurso_actual].modulos[idModulo_actual] = {
                            nombre_modulo:'no_asignado',
                            configuraciones:{},
                        }
                    }
                    if (resFinal[idCurso_actual].modulos && 
                        !resFinal[idCurso_actual].modulos[idModulo_actual].configuraciones.hasOwnProperty(idConfig_actual)){
                            resFinal[idCurso_actual].modulos[idModulo_actual].configuraciones[idConfig_actual] = {
                                nombre_configuracion:'no_asignado',
                                notas:[],
                            }
                    }
                    for (elem in notasRes){
                        resFinal[idCurso_actual].modulos[idModulo_actual].configuraciones[idConfig_actual].notas.push(
                                notasRes[elem]
                            )
                        }
                   
                }
            }
        }
    });
    getNameCourseCalifs(resFinal).then((resF)=>{
        res.status(200).send({
            ok: true,
            calificaciones: resF,
            message: 'Ok',
        });
    })
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
