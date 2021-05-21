const Estudiante = require('../models/estudiante');

function addStudent(req, res) {
    const { name, lastname, email, password } = req.body;
    const estudiante = new Estudiante();
    estudiante.nombre = name;
    estudiante.apellido = lastname;
    estudiante.email = email;
    estudiante.password = password;

    estudiante.save((err, newStudent) => {
        if (err) {
            res.status(500).send({
                ok: false,
                message: 'Error en el servidor',
            });
        } else if (!newStudent) {
            res.status(404).send({
                ok: false,
                message: 'Error al crear el Estudiante',
            });
        } else {
            res.status(200).send({
                ok: true,
                message: 'Estudiante creado correctamente',
            });
        }
    });
}

module.exports = {
    addStudent,
};
