const Instituto = require('../models/instituto');
const Curso = require('../models/curso');

function addInstitute(req, res) {
    try {
        const { name, courses } = req.body;
        const institute = new Instituto();
        institute.nombre = name;
        institute.curso = courses;

        institute.save((err, newInstitute) => {
            if (err) {
                res.status(500).send({
                    ok: false,
                    message: 'Error en el servidor',
                });
            } else if (!newInstitute) {
                res.status(404).send({
                    ok: false,
                    message: 'Error al crear el Instituto',
                });
            } else {
                res.status(200).send({
                    ok: true,
                    institute: newInstitute,
                    message: 'Instituto creado correctamente',
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

function addCourse(req, res) {
    try {
        const { id } = req.params;
        const { idCourse } = req.body;

        Instituto.findByIdAndUpdate(
            { _id: id },
            { $push: { curso: idCourse } },
            (err, instituteResult) => {
                if (err) {
                    res.status(500).send({
                        ok: false,
                        message: 'Error del servidor',
                    });
                } else if (!instituteResult) {
                    res.status(404).send({
                        ok: false,
                        message: 'No se ha encontrado el Instituto',
                    });
                } else {
                    res.status(200).send({
                        ok: true,
                        institute: instituteResult,
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

function getCourses(req, res) {
    try {
        const { id } = req.params;

        Instituto.findById({ _id: id }, (err, instituteResult) => {
            if (err) {
                res.status(500).send({
                    ok: false,
                    message: 'Error del servidor',
                });
            } else if (!instituteResult) {
                res.status(404).send({
                    ok: false,
                    message: 'No se ha encontrado el Instituto',
                });
            } else {
                Curso.find(
                    { _id: { $in: instituteResult.curso } },
                    { nombre: 1, descripcion: 1 },
                    (err, courses) => {
                        if (err) {
                            res.status(500).send({
                                ok: false,
                                message: 'Error del servidor',
                            });
                        } else if (!courses) {
                            res.status(404).send({
                                ok: false,
                                message:
                                    'No se ha encontrado cursos en el instituto',
                            });
                        } else {
                            res.status(200).send({
                                ok: true,
                                courses: courses,
                                message: 'Ok',
                            });
                        }
                    }
                );
            }
        });
    } catch (error) {
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

function getInstitute(req, res) {
    try {
        Instituto.find()
            .sort({ nombre: 'asc' })
            .exec((err, institutesResult) => {
                if (err) {
                    res.status(500).send({
                        ok: false,
                        message: 'Error en el servidor',
                    });
                } else if (!institutesResult) {
                    res.status(404).send({
                        ok: false,
                        message: 'No se ha encontrado ningún instituto',
                    });
                } else {
                    res.status(200).send({
                        ok: true,
                        institutes: institutesResult,
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

module.exports = {
    addInstitute,
    addCourse,
    getInstitute,
    getCourses,
};
