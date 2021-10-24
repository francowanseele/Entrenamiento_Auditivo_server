const express = require('express');
const CourseController = require('../controllers/course');

const api = express.Router();

api.post('/add-course', CourseController.addCourse);
api.post('/update-module/:id', CourseController.addModule);
api.get('/get-module-by-curse/:id', CourseController.getModules);
api.put('/add-config-dictation-module', CourseController.addConfigDictation);
api.post('/get_califications',CourseController.getCalificacionPorCursoYNotasPromedios)
api.post('/get_students_course',CourseController.getStudentsByIdCourse);
api.post('/get_teacher_courses',CourseController.getTeacherCourses);
api.get('/get-all-courses', CourseController.getAllCourse);
api.post('/get-cursa-student',CourseController.getCoursesCursaStudent);
api.put('/add-student-course',CourseController.addStudentToCourse);
api.post('/get-curso-personal',CourseController.getPersonalCourse)
module.exports = api;
