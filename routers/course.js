const express = require('express');
const CourseController = require('../controllers/course');

const api = express.Router();

api.post('/add-course', CourseController.addCourse);
api.post('/update-module/:id', CourseController.addModule);
api.get('/get-module-by-curse/:id', CourseController.getModules);
api.get('/get-config-dictation/:id', CourseController.getConfigDictation);
api.get(
    '/get-configs-dictations/:idModule',
    CourseController.getConfigsDictations
);
api.put('/add-config-dictation-module', CourseController.addConfigDictation);
api.post(
    '/get_califications',
    CourseController.getCalificacionPorCursoYNotasPromedios
);
api.post('/get_students_course', CourseController.getStudentsByIdCourse);
api.post('/get_teacher_courses', CourseController.getTeacherCourses);
api.get('/get-all-courses', CourseController.getAllCourse);
api.post('/get-cursa-student', CourseController.getCoursesCursaStudent);
api.put('/add-student-course', CourseController.addStudentToCourse);
api.put('/add-teacher-course', CourseController.addCourseToDictaTeacher);
api.post('/get-curso-personal', CourseController.getPersonalCourse);
api.put('/edit-course/:id', CourseController.editCourse);
api.put('/edit-module/:id', CourseController.editModule);
api.put('/edit-config-dictation/:id', CourseController.editConfigDictation);
api.put('/unregister-student-course', CourseController.unregisterStudenFromCourse);
api.put('/unregister-teacher-course', CourseController.unregisterTeacherFromCourse);
api.get('/user-has-permission-edit/:id', CourseController.userHasPermissionToEditCourse);

module.exports = api;
