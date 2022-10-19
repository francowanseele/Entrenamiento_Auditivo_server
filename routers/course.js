const express = require('express');
const CourseController = require('../controllers/course');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.post('/add-course', CourseController.addCourse);
api.post('/update-module/:id', [md_auth.ensureAuth], CourseController.addModule);
api.get('/get-module-by-curse/:id', [md_auth.ensureAuth], CourseController.getModules);
api.get('/get-config-dictation/:id', [md_auth.ensureAuth], CourseController.getConfigDictation);
api.get('/getconfig-dictation-by-string/:searchText', [md_auth.ensureAuth], CourseController.getConfigDictationByString);
api.get(
    '/get-configs-dictations/:idModule',
    [md_auth.ensureAuth],
    CourseController.getConfigsDictations
);
api.put('/add-config-dictation-module', [md_auth.ensureAuth], CourseController.addConfigDictation);
api.post(
    '/get_califications',
    [md_auth.ensureAuth],
    CourseController.getCalificacionPorCursoYNotasPromedios
);
api.post('/get_students_course', [md_auth.ensureAuth], CourseController.getStudentsByIdCourse);
api.post('/get_teacher_courses', [md_auth.ensureAuth], CourseController.getTeacherCourses);
api.get('/get-all-courses', [md_auth.ensureAuth], CourseController.getAllCourse);
api.get('/get-all-courses-regardless-institute', [md_auth.ensureAuth], CourseController.getAllCourseRegardlessInstituteUser);
api.post('/get-cursa-student', [md_auth.ensureAuth], CourseController.getCoursesCursaStudent);
api.put('/add-student-course', [md_auth.ensureAuth], CourseController.addStudentToCourse);
api.put('/add-teacher-course', [md_auth.ensureAuth], CourseController.addCourseToDictaTeacher);
api.post('/get-curso-personal', [md_auth.ensureAuth], CourseController.getPersonalCourse);
api.put('/edit-course/:id', [md_auth.ensureAuth], CourseController.editCourse);
api.put('/edit-module/:id', [md_auth.ensureAuth], CourseController.editModule);
api.put('/edit-config-dictation/:id', [md_auth.ensureAuth], CourseController.editConfigDictation);
api.put('/unregister-student-course', [md_auth.ensureAuth], CourseController.unregisterStudenFromCourse);
api.put('/unregister-teacher-course', [md_auth.ensureAuth], CourseController.unregisterTeacherFromCourse);
api.get('/user-has-permission-edit/:id', [md_auth.ensureAuth], CourseController.userHasPermissionToEditCourse);

module.exports = api;
