const express = require('express');
const CourseController = require('../controllers/course');

const api = express.Router();

api.post('/add-course', CourseController.addCourse);
api.post('/update-module/:id', CourseController.addModule);
api.get('/get-module-by-curse/:id', CourseController.getModules);
api.put('/add-config-dictation-module', CourseController.addConfigDictation);

module.exports = api;
