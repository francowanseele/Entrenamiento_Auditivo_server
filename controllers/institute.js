const db = require('../data/knex');
const { logError } = require('../services/errorService');

async function addInstitute(req, res) {
    try {
        const { name } = req.body;
        const ins = await db
            .knex('Instituto')
            .insert({ Nombre: name })
            .returning(['id', 'Nombre']);

        res.status(200).send({
            ok: true,
            institute: ins[0],
            message: 'Instituto creado correctamente',
        });
    } catch (error) {
        logError('addInstitute', error, req);
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

        res.status(200).send({
            ok: true,
            institute: [],
            message: 'Ok',
        });

        // Instituto.findByIdAndUpdate(
        //     { _id: id },
        //     { $push: { curso: idCourse } },
        //     (err, instituteResult) => {
        //         if (err) {
        //             res.status(500).send({
        //                 ok: false,
        //                 message: 'Error del servidor',
        //             });
        //         } else if (!instituteResult) {
        //             res.status(404).send({
        //                 ok: false,
        //                 message: 'No se ha encontrado el Instituto',
        //             });
        //         } else {
        //             res.status(200).send({
        //                 ok: true,
        //                 institute: instituteResult,
        //                 message: 'Ok',
        //             });
        //         }
        //     }
        // );
    } catch (error) {
        logError('addCourse', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getCourses(req, res) {
    try {
        const { id } = req.params;

        const cursos = await db
            .knex('Instituto')
            .where({ 'Instituto.id': id })
            .select(
                'Curso.id',
                'Curso.Nombre',
                'Curso.Descripcion',
                'Curso.Personal'
            )
            .join('Curso', 'Instituto.id', '=', 'Curso.InstitutoId');

        res.status(200).send({
            ok: true,
            courses: cursos,
            message: 'Ok',
        });
    } catch (error) {
        logError('getCourses', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getInstitute(_, res) {
    try {
        const institutos = await db.knex('Instituto').select('id', 'Nombre');

        res.status(200).send({
            ok: true,
            institutes: institutos,
            message: 'Ok',
        });
    } catch (error) {
        logError('getInstitute', error, null);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

async function getInstituteByUser(req, res) {
    try {
        const { idUser } = req.query;

        const institutes = await db
            .knex('Usuario_Instituto')
            .where({ 'Usuario_Instituto.UsuarioId': idUser })
            .select(
                'Instituto.id as InstitutoId',
                'Instituto.Nombre',
                'Usuario_Instituto.UsuarioId as UserId'
            )
            .join(
                'Instituto',
                'Usuario_Instituto.InstitutoId',
                '=',
                'Instituto.id'
            );

        res.status(200).send({
            ok: true,
            institutes: institutes,
            message: 'Ok',
        });
    } catch (error) {
        logError('getInstituteByUser', error, req);
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
    getInstituteByUser,
};
