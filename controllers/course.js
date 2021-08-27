const Curso = require('../models/curso');

function addCourse(req, res) {
    try {
        const { name, description, personal } = req.body;
        const curso = new Curso();
        curso.nombre = name;
        curso.descripcion = description;
        curso.personal = personal;

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

module.exports = {
    addCourse,
    addModule,
    getModules,
    addConfigDictation,
};
